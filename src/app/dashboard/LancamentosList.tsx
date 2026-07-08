"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";

export type LinhaLancamento = {
  id: string;
  data_vencimento: string;
  descricao: string;
  contraparte: string | null;
  valor: number;
  status_efetivo: "pendente" | "pago" | "vencido";
};

export function LancamentosList({
  titulo,
  linhas,
  contraparteLabel,
  addHref,
}: {
  titulo: string;
  linhas: LinhaLancamento[];
  contraparteLabel: string;
  addHref: string;
}) {
  const [aba, setAba] = useState<"pendente" | "pago" | "vencido">("pendente");
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    return linhas
      .filter((l) => l.status_efetivo === aba)
      .filter((l) => l.descricao.toLowerCase().includes(busca.toLowerCase()) || (l.contraparte ?? "").toLowerCase().includes(busca.toLowerCase()));
  }, [linhas, aba, busca]);

  const total = filtradas.reduce((acc, l) => acc + l.valor, 0);

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".8rem", marginBottom: ".8rem", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>{titulo}</h2>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <input
            placeholder="Pesquisar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              padding: ".4rem .6rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--background)",
              fontSize: ".85rem",
            }}
          />
          <Link href={addHref} className="btn-primary" style={{ padding: ".4rem .8rem", fontSize: ".82rem" }}>
            Adicionar
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.2rem", borderBottom: "1px solid var(--border)", marginBottom: ".6rem" }}>
        {(["pendente", "pago", "vencido"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            style={{
              background: "none",
              border: "none",
              borderBottom: aba === tab ? "2px solid var(--primary)" : "2px solid transparent",
              padding: ".5rem 0",
              fontSize: ".85rem",
              fontWeight: 600,
              color: aba === tab ? "var(--foreground)" : "var(--foreground-soft)",
              cursor: "pointer",
            }}
          >
            {tab === "pendente" ? "Em aberto" : tab === "pago" ? "Efetuados" : "Vencidos"}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <p style={{ color: "var(--foreground-soft)", fontSize: ".88rem", padding: "1rem 0" }}>Nenhum lançamento.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".86rem" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: ".72rem", color: "var(--foreground-soft)" }}>
              <th style={{ padding: ".3rem 0" }}>Data</th>
              <th style={{ padding: ".3rem" }}>Descrição</th>
              <th style={{ padding: ".3rem" }}>{contraparteLabel}</th>
              <th style={{ padding: ".3rem 0", textAlign: "right" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.slice(0, 8).map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: ".4rem 0" }}>{formatDate(l.data_vencimento)}</td>
                <td style={{ padding: ".4rem" }}>
                  <Link href={`/dashboard/lancamentos/${l.id}`}>{l.descricao}</Link>
                </td>
                <td style={{ padding: ".4rem", color: "var(--foreground-soft)" }}>{l.contraparte ?? "—"}</td>
                <td style={{ padding: ".4rem 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(l.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: ".6rem", paddingTop: ".5rem", borderTop: "1px solid var(--border)", fontSize: ".85rem", fontWeight: 600 }}>
        <span>Total</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
