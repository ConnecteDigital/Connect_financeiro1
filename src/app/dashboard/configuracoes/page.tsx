import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: categorias, error } = await supabase
    .from("categorias")
    .select("nome, ativa, grupos_categoria(nome)")
    .order("nome");

  const ativas = categorias?.filter((c) => c.ativa) ?? [];
  const legadas = categorias?.filter((c) => !c.ativa) ?? [];

  return (
    <>
      <div className="page-header">
        <h1>Configurações</h1>
        <p>Categorias, grupos contábeis e centros de custo.</p>
      </div>

      {error ? (
        <p className="placeholder-note">
          Sem conexão com o Supabase ainda. Depois de rodar <code>supabase/seed.sql</code>, a
          taxonomia migrada do sistema atual (grupos + categorias) aparece aqui.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="card">
            <h2 style={{ margin: "0 0 .6rem", fontSize: "1rem" }}>Categorias ativas</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {ativas.map((c, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: ".4rem 0",
                    borderTop: i ? "1px solid var(--border)" : "none",
                    fontSize: ".88rem",
                  }}
                >
                  <span>{c.nome}</span>
                  <span style={{ color: "var(--foreground-soft)" }}>
                    {(c.grupos_categoria as unknown as { nome: string } | null)?.nome}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {legadas.length > 0 && (
            <div className="card">
              <h2 style={{ margin: "0 0 .6rem", fontSize: "1rem" }}>
                Categorias históricas (inativas)
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", color: "var(--foreground-soft)" }}>
                {legadas.map((c, i) => (
                  <li key={i} style={{ padding: ".3rem 0", fontSize: ".86rem" }}>
                    {c.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="placeholder-note" style={{ marginTop: "1rem" }}>
        Próximo passo: telas de edição de categoria/grupo/centro de custo, e cadastro de Membros
        (você e a Anna Clara).
      </p>
    </>
  );
}
