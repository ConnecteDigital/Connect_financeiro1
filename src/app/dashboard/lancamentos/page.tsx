import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
};

export default async function LancamentosPage() {
  const supabase = await createClient();
  const { data: lancamentos, error } = await supabase
    .from("v_lancamentos")
    .select(
      "id, tipo, valor, descricao, data_vencimento, status_efetivo, clientes(nome), categorias(nome), contas(nome)"
    )
    .order("data_vencimento", { ascending: false })
    .limit(50);

  return (
    <>
      <div className="page-header">
        <h1>Entradas e Saídas</h1>
        <p>Lançamentos mais recentes — competência, vencimento, categoria e conta.</p>
      </div>

      {error ? (
        <p className="placeholder-note">
          Sem conexão com o Supabase ainda. Depois da migração dos CSVs de Entradas e Saídas, o
          histórico completo desde 2025 aparece aqui.
        </p>
      ) : lancamentos && lancamentos.length > 0 ? (
        <div className="card">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: ".75rem", color: "var(--foreground-soft)" }}>
                <th style={{ padding: ".4rem .5rem .4rem 0" }}>Vencimento</th>
                <th style={{ padding: ".4rem .5rem" }}>Descrição</th>
                <th style={{ padding: ".4rem .5rem" }}>Cliente</th>
                <th style={{ padding: ".4rem .5rem" }}>Categoria</th>
                <th style={{ padding: ".4rem .5rem" }}>Conta</th>
                <th style={{ padding: ".4rem .5rem" }}>Status</th>
                <th style={{ padding: ".4rem 0 .4rem .5rem", textAlign: "right" }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: ".5rem .5rem .5rem 0" }}>{formatDate(l.data_vencimento)}</td>
                  <td style={{ padding: ".5rem" }}>{l.descricao}</td>
                  <td style={{ padding: ".5rem", color: "var(--foreground-soft)" }}>
                    {(l.clientes as unknown as { nome: string } | null)?.nome ?? "—"}
                  </td>
                  <td style={{ padding: ".5rem", color: "var(--foreground-soft)" }}>
                    {(l.categorias as unknown as { nome: string } | null)?.nome ?? "—"}
                  </td>
                  <td style={{ padding: ".5rem", color: "var(--foreground-soft)" }}>
                    {(l.contas as unknown as { nome: string } | null)?.nome ?? "—"}
                  </td>
                  <td style={{ padding: ".5rem" }}>{STATUS_LABEL[l.status_efetivo] ?? l.status_efetivo}</td>
                  <td
                    style={{
                      padding: ".5rem 0 .5rem .5rem",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                      color: l.tipo === "entrada" ? "var(--positive)" : "var(--negative)",
                    }}
                  >
                    {l.tipo === "saida" ? "-" : ""}
                    {formatCurrency(Number(l.valor))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="placeholder-note">Nenhum lançamento cadastrado ainda.</p>
      )}

      <p className="placeholder-note" style={{ marginTop: "1rem" }}>
        Próximo passo: formulário de novo lançamento (com recorrência), filtros por período/conta/
        categoria e ação de estornar.
      </p>
    </>
  );
}
