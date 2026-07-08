"use client";

import { useMemo, useState } from "react";

type Opcao = { id: string; nome: string };
type Categoria = { id: string; nome: string; secao: string };
type Conta = { id: string; nome: string; conta_pai_id: string | null };

const SECOES_ENTRADA = ["receita_operacional", "outras_receitas"];

type LancamentoExistente = {
  id: string;
  tipo: "entrada" | "saida";
  valor: number;
  descricao: string;
  data_competencia: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: "pendente" | "pago";
  cliente_id: string | null;
  categoria_id: string | null;
  conta_id: string | null;
  centro_de_custo_id: string | null;
  taxas_e_juros: number | null;
  anotacoes: string | null;
};

export function LancamentoForm({
  action,
  clientes,
  categorias,
  contas,
  centrosDeCusto,
  lancamento,
  erro,
}: {
  action: (formData: FormData) => void;
  clientes: Opcao[];
  categorias: Categoria[];
  contas: Conta[];
  centrosDeCusto: Opcao[];
  lancamento?: LancamentoExistente;
  erro?: string;
}) {
  const [tipo, setTipo] = useState<"entrada" | "saida">(lancamento?.tipo ?? "entrada");
  const [jaPago, setJaPago] = useState(lancamento?.status === "pago");
  const [recorrenciaAtiva, setRecorrenciaAtiva] = useState(false);
  const [modoRecorrencia, setModoRecorrencia] = useState<"fixa" | "parcelada">("fixa");
  const hoje = new Date().toISOString().slice(0, 10);

  const categoriasFiltradas = useMemo(
    () =>
      categorias.filter((c) =>
        tipo === "entrada" ? SECOES_ENTRADA.includes(c.secao) : !SECOES_ENTRADA.includes(c.secao)
      ),
    [categorias, tipo]
  );

  return (
    <form action={action} className="card" style={{ display: "grid", gap: "1.1rem", maxWidth: "38rem" }}>
      {!lancamento && (
        <div className="toggle-group" role="radiogroup" aria-label="Tipo de lançamento">
          <input
            type="radio"
            name="tipo"
            value="entrada"
            id="tipo-entrada"
            checked={tipo === "entrada"}
            onChange={() => setTipo("entrada")}
          />
          <label htmlFor="tipo-entrada">Entrada</label>
          <input
            type="radio"
            name="tipo"
            value="saida"
            id="tipo-saida"
            checked={tipo === "saida"}
            onChange={() => setTipo("saida")}
          />
          <label htmlFor="tipo-saida">Saída</label>
        </div>
      )}
      {lancamento && <input type="hidden" name="tipo" value={tipo} />}

      <div className="form-row" style={{ gridTemplateColumns: "1fr 10rem" }}>
        <label className="form-field">
          <span>Descrição *</span>
          <input name="descricao" required defaultValue={lancamento?.descricao} />
        </label>
        <label className="form-field">
          <span>Valor (R$) *</span>
          <input
            name="valor"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={lancamento?.valor}
          />
        </label>
      </div>

      <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <label className="form-field">
          <span>Data de competência *</span>
          <input
            name="data_competencia"
            type="date"
            required
            defaultValue={lancamento?.data_competencia ?? hoje}
          />
        </label>
        <label className="form-field">
          <span>Data de vencimento *</span>
          <input
            name="data_vencimento"
            type="date"
            required
            defaultValue={lancamento?.data_vencimento ?? hoje}
          />
        </label>
      </div>

      <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <label className="form-field">
          <span>Categoria *</span>
          <select name="categoria_id" required defaultValue={lancamento?.categoria_id ?? ""}>
            <option value="" disabled>
              Selecione
            </option>
            {categoriasFiltradas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Conta *</span>
          <select name="conta_id" required defaultValue={lancamento?.conta_id ?? ""}>
            <option value="" disabled>
              Selecione
            </option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.conta_pai_id ? `— ${c.nome}` : c.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <label className="form-field">
          <span>Cliente</span>
          <select name="cliente_id" defaultValue={lancamento?.cliente_id ?? ""}>
            <option value="">Nenhum</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Centro de custo</span>
          <select name="centro_de_custo_id" defaultValue={lancamento?.centro_de_custo_id ?? ""}>
            <option value="">Nenhum</option>
            {centrosDeCusto.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="form-field">
        <span>Taxas e juros (R$, opcional)</span>
        <input name="taxas_e_juros" type="number" step="0.01" min="0" defaultValue={lancamento?.taxas_e_juros ?? ""} />
      </label>

      <label className="form-field">
        <span>Anotações</span>
        <textarea name="anotacoes" rows={2} defaultValue={lancamento?.anotacoes ?? ""} />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".88rem", fontWeight: 600 }}>
        <input
          type="checkbox"
          name="ja_pago"
          checked={jaPago}
          onChange={(e) => setJaPago(e.target.checked)}
        />
        {tipo === "entrada" ? "Já foi recebido" : "Já foi pago"}
      </label>

      {jaPago && (
        <label className="form-field" style={{ maxWidth: "12rem" }}>
          <span>Data do {tipo === "entrada" ? "recebimento" : "pagamento"}</span>
          <input name="data_pagamento" type="date" defaultValue={lancamento?.data_pagamento ?? hoje} />
        </label>
      )}

      {!lancamento && (
        <div className="card" style={{ background: "var(--background)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".88rem", fontWeight: 600 }}>
            <input
              type="checkbox"
              name="recorrencia_ativa"
              checked={recorrenciaAtiva}
              onChange={(e) => setRecorrenciaAtiva(e.target.checked)}
            />
            Recorrência / parcelamento
          </label>

          {recorrenciaAtiva && (
            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label className="form-field">
                  <span>Periodicidade</span>
                  <select name="periodicidade" defaultValue="mensal">
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Modo</span>
                  <select
                    name="modo_recorrencia"
                    value={modoRecorrencia}
                    onChange={(e) => setModoRecorrencia(e.target.value as "fixa" | "parcelada")}
                  >
                    <option value="fixa">Fixa (sem data final)</option>
                    <option value="parcelada">Parcelada</option>
                  </select>
                </label>
              </div>
              {modoRecorrencia === "parcelada" && (
                <label className="form-field" style={{ maxWidth: "10rem" }}>
                  <span>Quantidade de parcelas</span>
                  <input name="parcelas_total" type="number" min="1" required />
                </label>
              )}
              {modoRecorrencia === "fixa" && (
                <p style={{ margin: 0, fontSize: ".82rem", color: "var(--foreground-soft)" }}>
                  Gera as próximas 12 ocorrências agora; mais à frente um job periódico mantém a
                  fila de ocorrências futuras sempre preenchida.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {erro && <p className="form-error">{erro}</p>}

      <button type="submit" className="btn-primary">
        {lancamento ? "Salvar alterações" : "Adicionar lançamento"}
      </button>
    </form>
  );
}
