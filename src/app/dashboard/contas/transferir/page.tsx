import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createTransferencia } from "../actions";

export default async function TransferirPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createClient();
  const { data: contas } = await supabase
    .from("contas")
    .select("id, nome, conta_pai_id")
    .order("nome");
  const hoje = format(new Date(), "yyyy-MM-dd");

  return (
    <>
      <div className="page-header">
        <h1>Transferir entre contas</h1>
        <p>Debita a origem e credita o destino — aparece nos relatórios como transferência, não como despesa.</p>
      </div>
      <form action={createTransferencia} className="card" style={{ display: "grid", gap: "1rem", maxWidth: "28rem" }}>
        <label className="form-field">
          <span>De</span>
          <select name="conta_origem_id" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {contas?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.conta_pai_id ? `— ${c.nome}` : c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Para</span>
          <select name="conta_destino_id" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {contas?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.conta_pai_id ? `— ${c.nome}` : c.nome}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label className="form-field">
            <span>Valor (R$)</span>
            <input name="valor" type="number" step="0.01" min="0.01" required />
          </label>
          <label className="form-field">
            <span>Data</span>
            <input name="data" type="date" required defaultValue={hoje} />
          </label>
        </div>
        <label className="form-field">
          <span>Descrição (opcional)</span>
          <input name="descricao" placeholder="Ex: repasse mensal para investimento" />
        </label>
        {erro && <p className="form-error">{erro}</p>}
        <button type="submit" className="btn-primary">
          Transferir
        </button>
      </form>
    </>
  );
}
