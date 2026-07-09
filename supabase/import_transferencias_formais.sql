-- Rode este arquivo sozinho (não precisa rodar o import_historico.sql de novo
-- — isso duplicaria as entradas/saídas, que não têm proteção contra
-- repetição). As 17 transferências reais da tela de Transferências do
-- sistema antigo (todas Caixa da empresa -> Investimento), que faltaram na
-- primeira importação porque vieram num export separado.

insert into transferencias (conta_origem_id, conta_destino_id, valor, data, descricao)
select ct_origem.id, ct_destino.id, v.valor::numeric, v.data::date, v.descricao
from (values
  (8973.00, '2026-01-01', 'Transferência'),
  (3486.65, '2026-01-01', 'Transferência'),
  (2178.08, '2026-01-01', 'Transferência'),
  (24.00, '2026-01-01', 'Transferência'),
  (0.78, '2026-01-01', 'Transferência'),
  (2237.70, '2026-03-31', 'Transferência despesas'),
  (5000.00, '2026-04-15', 'Transferência Investimento'),
  (2073.01, '2026-04-15', 'Transferência Imposto'),
  (10090.63, '2026-05-05', 'Transferência'),
  (5000.00, '2026-05-14', 'Transferência'),
  (2179.72, '2026-05-14', 'Transferência'),
  (730.28, '2026-05-14', 'Transferência'),
  (6437.96, '2026-06-02', 'Transferência'),
  (5000.00, '2026-06-12', 'Transferência'),
  (2211.01, '2026-06-12', 'Transferência'),
  (7774.65, '2026-07-01', 'Transferência'),
  (1500.00, '2026-07-01', 'Transferência')
) as v(valor, data, descricao)
join contas ct_origem on ct_origem.nome = 'Caixa da empresa' and ct_origem.conta_pai_id is null
join contas ct_destino on ct_destino.nome = 'Investimento' and ct_destino.conta_pai_id is null
where not exists (
  select 1 from transferencias t
  where t.valor = v.valor::numeric and t.data = v.data::date
);
