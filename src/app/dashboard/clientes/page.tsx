import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("id, nome, tipo_pessoa, cpf_cnpj, email, telefone")
    .order("nome");

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Clientes</h1>
          <p>Cadastro único — nome é o único campo obrigatório.</p>
        </div>
        <Link href="/dashboard/clientes/novo" className="btn-primary">
          Novo cliente
        </Link>
      </div>

      {error ? (
        <p className="placeholder-note">
          Sem conexão com o Supabase ainda. Assim que os ~140 clientes forem migrados do sistema
          atual, a lista aparece aqui.
        </p>
      ) : clientes && clientes.length > 0 ? (
        <div className="card">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: ".75rem", color: "var(--foreground-soft)" }}>
                <th style={{ padding: ".4rem 0" }}>Nome</th>
                <th style={{ padding: ".4rem 0" }}>E-mail</th>
                <th style={{ padding: ".4rem 0" }}>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: ".5rem 0" }}>
                    <Link href={`/dashboard/clientes/${cliente.id}`}>{cliente.nome}</Link>
                  </td>
                  <td style={{ padding: ".5rem 0", color: "var(--foreground-soft)" }}>
                    {cliente.email || "—"}
                  </td>
                  <td style={{ padding: ".5rem 0", color: "var(--foreground-soft)" }}>
                    {cliente.telefone || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="placeholder-note">Nenhum cliente cadastrado ainda.</p>
      )}

      <p className="placeholder-note" style={{ marginTop: "1rem" }}>
        Próximo passo: formulário de cadastro/edição e importação em massa do CSV migrado.
      </p>
    </>
  );
}
