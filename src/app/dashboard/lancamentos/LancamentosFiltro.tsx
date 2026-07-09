"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Categoria = { id: string; nome: string; secao: string };

const SECOES_ENTRADA = ["receita_operacional", "outras_receitas"];

export function LancamentosFiltro({
  tipo,
  categoriaId,
  categorias,
  inicio,
  fim,
}: {
  tipo: "entrada" | "saida" | "";
  categoriaId: string;
  categorias: Categoria[];
  inicio: string;
  fim: string;
}) {
  const router = useRouter();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(categoriaId);
  const [inicioCampo, setInicioCampo] = useState(inicio);
  const [fimCampo, setFimCampo] = useState(fim);

  const categoriasVisiveis = categorias.filter((c) =>
    tipo === "" ? true : tipo === "entrada" ? SECOES_ENTRADA.includes(c.secao) : !SECOES_ENTRADA.includes(c.secao)
  );

  function montarQuery(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const valores = { tipo, categoria: categoriaSelecionada, inicio: inicioCampo, fim: fimCampo, ...overrides };
    if (valores.tipo) params.set("tipo", valores.tipo);
    if (valores.categoria) params.set("categoria", valores.categoria);
    if (valores.inicio) params.set("inicio", valores.inicio);
    if (valores.fim) params.set("fim", valores.fim);
    return params.toString();
  }

  function aplicarFiltros() {
    router.push(`/dashboard/lancamentos?${montarQuery({})}`);
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "1.2rem", borderBottom: "1px solid var(--border)", marginBottom: ".8rem" }}>
        {[
          { key: "", label: "Todos" },
          { key: "entrada", label: "Entradas" },
          { key: "saida", label: "Saídas" },
        ].map((opt) => (
          <Link
            key={opt.key}
            href={`/dashboard/lancamentos?${montarQuery({ tipo: opt.key })}`}
            style={{
              padding: ".5rem 0",
              fontSize: ".88rem",
              fontWeight: 600,
              textDecoration: "none",
              color: tipo === opt.key ? "var(--foreground)" : "var(--foreground-soft)",
              borderBottom: tipo === opt.key ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="date"
          value={inicioCampo}
          onChange={(e) => setInicioCampo(e.target.value)}
          style={{ padding: ".45rem .5rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", fontSize: ".85rem" }}
        />
        <span style={{ color: "var(--foreground-soft)" }}>até</span>
        <input
          type="date"
          value={fimCampo}
          onChange={(e) => setFimCampo(e.target.value)}
          style={{ padding: ".45rem .5rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", fontSize: ".85rem" }}
        />

        <select
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          style={{
            padding: ".45rem .6rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            fontSize: ".85rem",
          }}
        >
          <option value="">Todas as categorias</option>
          {categoriasVisiveis.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <button className="btn-primary" style={{ padding: ".45rem .9rem", fontSize: ".85rem" }} onClick={aplicarFiltros}>
          Filtrar
        </button>
      </div>
    </div>
  );
}
