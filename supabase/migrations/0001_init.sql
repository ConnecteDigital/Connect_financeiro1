-- Connect Financeiro (interno) — schema inicial
-- Convenções: nomes de tabela e coluna em português, snake_case, para ficar
-- alinhado com a linguagem do negócio (o mesmo vocabulário usado no plano).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Contas e caixinhas (uma caixinha é uma conta com conta_pai_id preenchido)
-- ---------------------------------------------------------------------------
create table contas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  conta_pai_id uuid references contas (id) on delete restrict,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Taxonomia contábil: grupo decide a seção da DFC; categoria pertence a um grupo
-- ---------------------------------------------------------------------------
create type secao_dfc as enum (
  'receita_operacional',
  'custo_operacional',
  'despesas_operacionais',
  'outras_receitas',
  'atividades_investimento',
  'atividades_financiamento'
);

create table grupos_categoria (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  secao secao_dfc not null
);

create table categorias (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references grupos_categoria (id) on delete restrict,
  nome text not null,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

create table centros_de_custo (
  id uuid primary key default gen_random_uuid(),
  nome text not null
);

-- ---------------------------------------------------------------------------
-- Clientes — cadastro único, sem fornecedor (não usado por este negócio)
-- ---------------------------------------------------------------------------
create type tipo_pessoa as enum ('fisica', 'juridica');

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo_pessoa tipo_pessoa,
  cpf_cnpj text,
  email text,
  telefone text,
  endereco jsonb,
  anotacoes text,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Recorrência: fixa (sem fim) ou parcelada (n parcelas)
-- ---------------------------------------------------------------------------
create type periodicidade as enum ('semanal', 'mensal');
create type modo_recorrencia as enum ('fixa', 'parcelada');

create table recorrencias (
  id uuid primary key default gen_random_uuid(),
  modo modo_recorrencia not null,
  periodicidade periodicidade not null,
  parcelas_total int,
  criado_em timestamptz not null default now(),
  constraint parcelas_total_exigido check (
    (modo = 'parcelada' and parcelas_total is not null)
    or (modo = 'fixa' and parcelas_total is null)
  )
);

-- ---------------------------------------------------------------------------
-- Lançamentos: entradas e saídas
-- status guarda só pendente/pago — "vencido" é derivado (ver view abaixo),
-- porque é a data de vencimento passada que define isso, não um estado gravado.
-- ---------------------------------------------------------------------------
create type tipo_lancamento as enum ('entrada', 'saida');
create type status_lancamento as enum ('pendente', 'pago');

create table lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_lancamento not null,
  valor numeric(14, 2) not null check (valor > 0),
  descricao text not null,
  data_competencia date not null,
  data_vencimento date not null,
  data_pagamento date,
  status status_lancamento not null default 'pendente',
  cliente_id uuid references clientes (id) on delete set null,
  categoria_id uuid not null references categorias (id) on delete restrict,
  conta_id uuid not null references contas (id) on delete restrict,
  centro_de_custo_id uuid references centros_de_custo (id) on delete set null,
  recorrencia_id uuid references recorrencias (id) on delete set null,
  taxas_e_juros numeric(14, 2),
  anotacoes text,
  criado_em timestamptz not null default now(),
  constraint data_pagamento_consistente check (
    (status = 'pago' and data_pagamento is not null)
    or (status = 'pendente' and data_pagamento is null)
  )
);

create index lancamentos_conta_id_idx on lancamentos (conta_id);
create index lancamentos_cliente_id_idx on lancamentos (cliente_id);
create index lancamentos_categoria_id_idx on lancamentos (categoria_id);
create index lancamentos_data_vencimento_idx on lancamentos (data_vencimento);

-- ---------------------------------------------------------------------------
-- Anexos de lançamento (aba "Documentos" do sistema atual)
-- ---------------------------------------------------------------------------
create table lancamento_anexos (
  id uuid primary key default gen_random_uuid(),
  lancamento_id uuid not null references lancamentos (id) on delete cascade,
  caminho_arquivo text not null,
  nome_arquivo text not null,
  enviado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Transferência entre contas/caixinhas — operação nativa, não categoria
-- ---------------------------------------------------------------------------
create table transferencias (
  id uuid primary key default gen_random_uuid(),
  conta_origem_id uuid not null references contas (id) on delete restrict,
  conta_destino_id uuid not null references contas (id) on delete restrict,
  valor numeric(14, 2) not null check (valor > 0),
  data date not null,
  descricao text,
  criado_em timestamptz not null default now(),
  constraint contas_diferentes check (conta_origem_id <> conta_destino_id)
);

create index transferencias_conta_origem_idx on transferencias (conta_origem_id);
create index transferencias_conta_destino_idx on transferencias (conta_destino_id);

-- ---------------------------------------------------------------------------
-- Metas — fase 2, tabela criada desde já para não migrar schema depois
-- ---------------------------------------------------------------------------
create table metas (
  id uuid primary key default gen_random_uuid(),
  mes date not null, -- sempre dia 1 do mês de referência
  valor_alvo numeric(14, 2) not null,
  categoria_id uuid references categorias (id) on delete cascade,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Views derivadas
-- ---------------------------------------------------------------------------

-- Lançamentos com status efetivo (inclui "vencido", derivado por data)
create view v_lancamentos as
select
  l.*,
  case
    when l.status = 'pendente' and l.data_vencimento < current_date then 'vencido'
    else l.status::text
  end as status_efetivo
from lancamentos l;

-- Saldo por conta: entradas pagas − saídas pagas + transferências recebidas − transferências enviadas
create view v_saldo_contas as
select
  c.id as conta_id,
  c.nome,
  c.conta_pai_id,
  coalesce(sum(case when l.tipo = 'entrada' and l.status = 'pago' then l.valor else 0 end), 0)
    - coalesce(sum(case when l.tipo = 'saida' and l.status = 'pago' then l.valor else 0 end), 0)
    + coalesce((select sum(t.valor) from transferencias t where t.conta_destino_id = c.id), 0)
    - coalesce((select sum(t.valor) from transferencias t where t.conta_origem_id = c.id), 0)
    as saldo
from contas c
left join lancamentos l on l.conta_id = c.id
group by c.id, c.nome, c.conta_pai_id;

-- ---------------------------------------------------------------------------
-- RLS: sistema interno de 2 usuários com o mesmo nível de acesso —
-- qualquer usuário autenticado pode ler/escrever tudo, sem distinção de papel.
-- ---------------------------------------------------------------------------
alter table contas enable row level security;
alter table grupos_categoria enable row level security;
alter table categorias enable row level security;
alter table centros_de_custo enable row level security;
alter table clientes enable row level security;
alter table recorrencias enable row level security;
alter table lancamentos enable row level security;
alter table lancamento_anexos enable row level security;
alter table transferencias enable row level security;
alter table metas enable row level security;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'contas', 'grupos_categoria', 'categorias', 'centros_de_custo',
      'clientes', 'recorrencias', 'lancamentos', 'lancamento_anexos',
      'transferencias', 'metas'
    ])
  loop
    execute format(
      'create policy %I on %I for all to authenticated using (true) with check (true);',
      t || '_authenticated_full_access', t
    );
  end loop;
end $$;
