import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { LancamentosFiltro } from "./LancamentosFiltro";

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
};

const POR_PAGINA = 30;

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; categoria?: string; pagina?: string }>;
}) {
  const { tipo, categoria, pagina } = await searchParams;
  const paginaAtual = Math.max(1, Number(pagina) || 1);
  const supabase = await createClient();

  const [{ data: categorias }, resultado] = await Promise.all([
    supabase.from("categorias").select("id, nome, grupos_categoria(secao)").order("nome"),
    (() => {
      let query = supabase
        .from("v_lancamentos")
        .select(
          "id, tipo, valor, descricao, data_vencimento, status_efetivo, clientes(nome), categorias(nome), contas(nome)",
          { count: "exact" }
        );
      if (tipo === "entrada" || tipo === "saida") query = query.eq("tipo", tipo);
      if (categoria) query = query.eq("categoria_id", categoria);
      return query
        .order("data_vencimento", { ascending: false })
        .range((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA - 1);
    })(),
  ]);

  const { data: lancamentos, error, count } = resultado;

  const categoriasFiltro =
    categorias?.map((c) => ({
      id: c.id,
      nome: c.nome,
      secao: (c.grupos_categoria as unknown as { secao: string } | null)?.secao ?? "",
    })) ?? [];

  const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / POR_PAGINA));

  function hrefPagina(p: number) {
    const params = new URLSearchParams();
    if (tipo) params.set("tipo", tipo);
    if (categoria) params.set("categoria", categoria);
    params.set("pagina", String(p));
    return `/dashboard/lancamentos?${params.toString()}`;
  }

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Entradas e Saídas</h1>
          <p>Competência, vencimento, categoria e conta — filtre por tipo e categoria.</p>
        </div>
        <Link href="/dashboard/lancamentos/novo" className="btn-primary">
          Novo lançamento
        </Link>
      </div>

      {error ? (
        <p className="placeholder-note">
          Sem conexão com o Supabase ainda. Assim que as chaves estiverem configuradas, o
          histórico completo aparece aqui.
        </p>
      ) : (
        <>
          <LancamentosFiltro
            tipo={tipo === "entrada" || tipo === "saida" ? tipo : ""}
            categoriaId={categoria ?? ""}
            categorias={categoriasFiltro}
          />

          {lancamentos && lancamentos.length > 0 ? (
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
                      <td style={{ padding: ".5rem" }}>
                        <Link href={`/dashboard/lancamentos/${l.id}`}>{l.descricao}</Link>
                      </td>
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

              {totalPaginas > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: ".5rem", marginTop: "1rem" }}>
                  {paginaAtual > 1 && (
                    <Link href={hrefPagina(paginaAtual - 1)} className="btn-secondary" style={{ padding: ".3rem .7rem", fontSize: ".8rem" }}>
                      {"<"}
                    </Link>
                  )}
                  <span style={{ fontSize: ".82rem", color: "var(--foreground-soft)" }}>
                    Página {paginaAtual} de {totalPaginas} — {count} lançamentos
                  </span>
                  {paginaAtual < totalPaginas && (
                    <Link href={hrefPagina(paginaAtual + 1)} className="btn-secondary" style={{ padding: ".3rem .7rem", fontSize: ".8rem" }}>
                      {">"}
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="placeholder-note">Nenhum lançamento encontrado com esse filtro.</p>
          )}
        </>
      )}
    </>
  );
}
