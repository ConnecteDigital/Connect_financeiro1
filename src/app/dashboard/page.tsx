import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export default async function PainelPage() {
  const supabase = await createClient();

  const { data: contas, error } = await supabase
    .from("v_saldo_contas")
    .select("conta_id, nome, conta_pai_id, saldo")
    .is("conta_pai_id", null);

  const saldoTotal = contas?.reduce((acc, conta) => acc + Number(conta.saldo), 0) ?? 0;

  return (
    <>
      <div className="page-header">
        <h1>Painel</h1>
        <p>Visão geral do caixa da empresa.</p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "1.2rem",
        }}
      >
        <div className="card">
          <p style={{ margin: "0 0 .3rem", fontSize: ".8rem", color: "var(--foreground-soft)" }}>
            Saldo atual
          </p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
            {error ? "—" : formatCurrency(saldoTotal)}
          </p>
        </div>
        <div className="card">
          <p style={{ margin: "0 0 .3rem", fontSize: ".8rem", color: "var(--foreground-soft)" }}>
            Recebidos (mês)
          </p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "var(--positive)" }}>
            —
          </p>
        </div>
        <div className="card">
          <p style={{ margin: "0 0 .3rem", fontSize: ".8rem", color: "var(--foreground-soft)" }}>
            Despesas (mês)
          </p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "var(--negative)" }}>
            —
          </p>
        </div>
        <div className="card">
          <p style={{ margin: "0 0 .3rem", fontSize: ".8rem", color: "var(--foreground-soft)" }}>
            Vencidos
          </p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "var(--warning)" }}>
            —
          </p>
        </div>
      </div>

      {error ? (
        <p className="placeholder-note">
          Ainda sem conexão com o Supabase (variáveis de ambiente não configuradas) — assim que o
          projeto estiver criado e as chaves preenchidas em <code>.env.local</code>, os números
          reais aparecem aqui.
        </p>
      ) : (
        <div className="card">
          <h2 style={{ margin: "0 0 .8rem", fontSize: "1rem" }}>Contas</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
            <tbody>
              {contas?.map((conta) => (
                <tr key={conta.conta_id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: ".5rem 0" }}>{conta.nome}</td>
                  <td style={{ padding: ".5rem 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(Number(conta.saldo))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="placeholder-note" style={{ marginTop: "1rem" }}>
        Próximo passo: gráfico de evolução do saldo, faturamento por cliente/categoria e lista de
        vencidos — entram assim que os primeiros lançamentos (reais ou migrados) existirem.
      </p>
    </>
  );
}
