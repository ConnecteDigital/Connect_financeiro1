"use client";

type Cliente = {
  id: string;
  nome: string;
  tipo_pessoa: "fisica" | "juridica" | null;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  anotacoes: string | null;
};

export function ClienteForm({
  action,
  cliente,
  erro,
}: {
  action: (formData: FormData) => void;
  cliente?: Cliente;
  erro?: string;
}) {
  return (
    <form action={action} className="card" style={{ display: "grid", gap: "1rem", maxWidth: "32rem" }}>
      <label className="form-field">
        <span>Nome *</span>
        <input name="nome" required defaultValue={cliente?.nome} placeholder="Ex: Desentupidora Solução (Salvador)" />
      </label>

      <label className="form-field">
        <span>Tipo de pessoa</span>
        <select name="tipo_pessoa" defaultValue={cliente?.tipo_pessoa ?? ""}>
          <option value="">Não informado</option>
          <option value="fisica">Pessoa física</option>
          <option value="juridica">Pessoa jurídica</option>
        </select>
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <label className="form-field">
          <span>CPF/CNPJ</span>
          <input name="cpf_cnpj" defaultValue={cliente?.cpf_cnpj ?? ""} />
        </label>
        <label className="form-field">
          <span>Telefone</span>
          <input name="telefone" defaultValue={cliente?.telefone ?? ""} />
        </label>
      </div>

      <label className="form-field">
        <span>E-mail</span>
        <input name="email" type="email" defaultValue={cliente?.email ?? ""} />
      </label>

      <label className="form-field">
        <span>Anotações</span>
        <textarea name="anotacoes" rows={3} defaultValue={cliente?.anotacoes ?? ""} />
      </label>

      {erro && <p className="form-error">{erro}</p>}

      <div style={{ display: "flex", gap: ".7rem", alignItems: "center" }}>
        <button type="submit" className="btn-primary">
          {cliente ? "Salvar alterações" : "Adicionar cliente"}
        </button>
      </div>
    </form>
  );
}
