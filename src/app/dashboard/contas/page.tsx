import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";

export default async function ContasPage() {
  const supabase = await createClient();
  const { data: saldos, error } = await supabase
    .from("v_saldo_contas")
    .select("conta_id, nome, conta_pai_id, saldo")
    .order("nome");

  const contasPrincipais = saldos?.filter((c) => !c.conta_pai_id) ?? [];
  const caixinhasPorConta = new Map<string, typeof saldos>();
  saldos?.forEach((c) => {
    if (c.conta_pai_id) {
      const lista = caixinhasPorConta.get(c.conta_pai_id) ?? [];
      lista.push(c);
      caixinhasPorConta.set(c.conta_pai_id, lista);
    }
  });

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Contas</h1>
          <p>Caixa da empresa, Investimento e as caixinhas dentro de cada uma.</p>
        </div>
        <div style={{ display: "flex", gap: ".6rem" }}>
          <Link href="/dashboard/contas/nova-caixinha" className="btn-secondary">
            Nova caixinha
          </Link>
          <Link href="/dashboard/contas/transferir" className="btn-primary">
            Transferir
          </Link>
        </div>
      </div>

      {error ? (
        <p className="placeholder-note">
          Sem conexão com o Supabase ainda. Depois de rodar a migração e o seed, as duas contas
          (Caixa da empresa e Investimento) já aparecem aqui prontas para receber caixinhas.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {contasPrincipais.map((conta) => (
            <div className="card" key={conta.conta_id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{conta.nome}</h2>
                <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(Number(conta.saldo))}
                </span>
              </div>
              {(caixinhasPorConta.get(conta.conta_id) ?? []).length > 0 && (
                <ul style={{ margin: ".8rem 0 0", padding: 0, listStyle: "none" }}>
                  {caixinhasPorConta.get(conta.conta_id)!.map((caixinha) => (
                    <li
                      key={caixinha.conta_id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: ".4rem .6rem",
                        borderTop: "1px solid var(--border)",
                        fontSize: ".88rem",
                        color: "var(--foreground-soft)",
                      }}
                    >
                      <span>{caixinha.nome}</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatCurrency(Number(caixinha.saldo))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
