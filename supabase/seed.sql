-- Dados iniciais: taxonomia contábil (grupos + categorias) migrada do sistema
-- atual, e as duas contas principais. Caixinhas ficam para serem criadas pela
-- tela de Contas, já que os nomes exatos ainda não foram definidos.

insert into grupos_categoria (nome, secao) values
  ('Receita Operacional', 'receita_operacional'),
  ('Custo Operacional', 'custo_operacional'),
  ('Despesas Operacionais', 'despesas_operacionais'),
  ('Outras Receitas', 'outras_receitas'),
  ('Atividades de Investimento', 'atividades_investimento'),
  ('Atividades de Financiamento', 'atividades_financiamento');

insert into categorias (grupo_id, nome, ativa)
select gc.id, c.nome, true
from grupos_categoria gc, (values
  ('Receita Operacional', 'Mensalidade'),
  ('Receita Operacional', 'Mensalidade Semanal'),
  ('Receita Operacional', 'Freelancer'),
  ('Receita Operacional', 'Criação de site'),
  ('Receita Operacional', 'Receitas com Serviços'),
  ('Receita Operacional', 'Receitas com Vendas'),
  ('Receita Operacional', 'Dívidas de clientes'),
  ('Custo Operacional', 'Custos dos Serviços Prestados'),
  ('Custo Operacional', 'Imposto'),
  ('Despesas Operacionais', 'Salários'),
  ('Despesas Operacionais', 'Prólabore'),
  ('Despesas Operacionais', 'Retirada de lucro'),
  ('Despesas Operacionais', 'Contabilidade'),
  ('Despesas Operacionais', 'Compras de uso e consumo'),
  ('Despesas Operacionais', 'Cartões da empresa'),
  ('Despesas Operacionais', 'Serviços contratados pela empresa'),
  ('Despesas Operacionais', 'Despesas da empresa'),
  ('Despesas Operacionais', 'Despesas Administrativas'),
  ('Despesas Operacionais', 'Despesas com Pessoal'),
  ('Despesas Operacionais', 'Despesas Fixas'),
  ('Despesas Operacionais', 'Manutenção do escritório'),
  ('Despesas Operacionais', 'Outros Tributos'),
  ('Despesas Operacionais', 'Recuperação de Despesas Fixas'),
  -- Histórica: usada antes de existir transferência nativa entre contas.
  -- Fica disponível, mas o ideal daqui pra frente é usar "Transferir" em vez
  -- de lançar uma saída nessa categoria.
  ('Despesas Operacionais', 'Investimento'),
  ('Atividades de Investimento', 'Compra de ativo fixo'),
  ('Atividades de Financiamento', 'Aporte de capital'),
  ('Atividades de Financiamento', 'Obtenção de empréstimo'),
  ('Atividades de Financiamento', 'Pagamento de empréstimo'),
  ('Atividades de Financiamento', 'Retirada de capital')
) as c(grupo_nome, nome)
where gc.nome = c.grupo_nome;

-- "Porcentagem" segue ativa: o histórico mostra uso real e recorrente (35
-- lançamentos com dezenas de clientes diferentes), não é coisa legada.
insert into categorias (grupo_id, nome, ativa)
select gc.id, 'Porcentagem', true
from grupos_categoria gc
where gc.nome = 'Receita Operacional';

-- "Porcentagem de João" é legada de verdade (zero lançamentos no histórico
-- desde 2024): preserva o nome pra manter compatibilidade com relatórios
-- antigos, mas não fica disponível pra novos lançamentos (virou salário fixo).
insert into categorias (grupo_id, nome, ativa)
select gc.id, 'Porcentagem de João', false
from grupos_categoria gc
where gc.nome = 'Receita Operacional';

insert into contas (nome) values
  ('Caixa da empresa'),
  ('Investimento');
