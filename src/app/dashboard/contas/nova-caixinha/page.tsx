import { createClient } from "@/lib/supabase/server";
import { createCaixinha } from "../actions";

export default async function NovaCaixinhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createClient();
  const { data: contasPrincipais } = await supabase
    .from("contas")
    .select("id, nome")
    .is("conta_pai_id", null)
    .order("nome");

  return (
    <>
      <div className="page-header">
        <h1>Nova caixinha</h1>
        <p>Uma caixinha é uma subdivisão de uma conta, com saldo próprio.</p>
      </div>
      <form action={createCaixinha} className="card" style={{ display: "grid", gap: "1rem", maxWidth: "26rem" }}>
        <label className="form-field">
          <span>Dentro de qual conta?</span>
          <select name="conta_pai_id" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {contasPrincipais?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Nome da caixinha</span>
          <input name="nome" required placeholder="Ex: Reserva de emergência" />
        </label>
        {erro && <p className="form-error">{erro}</p>}
        <button type="submit" className="btn-primary">
          Criar caixinha
        </button>
      </form>
    </>
  );
}
