"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Categoria = { id: string; nome: string; secao: string };

const SECOES_ENTRADA = ["receita_operacional", "outras_receitas"];

export function LancamentosFiltro({
  tipo,
  categoriaId,
  categorias,
}: {
  tipo: "entrada" | "saida" | "";
  categoriaId: string;
  categorias: Categoria[];
}) {
  const router = useRouter();

  const categoriasVisiveis = categorias.filter((c) =>
    tipo === "" ? true : tipo === "entrada" ? SECOES_ENTRADA.includes(c.secao) : !SECOES_ENTRADA.includes(c.secao)
  );

  function irPara(novoTipo: string, novaCategoria: string) {
    const params = new URLSearchParams();
    if (novoTipo) params.set("tipo", novoTipo);
    if (novaCategoria) params.set("categoria", novaCategoria);
    router.push(`/dashboard/lancamentos?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: "1.2rem", borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "", label: "Todos" },
          { key: "entrada", label: "Entradas" },
          { key: "saida", label: "Saídas" },
        ].map((opt) => (
          <Link
            key={opt.key}
            href={`/dashboard/lancamentos${opt.key ? `?tipo=${opt.key}` : ""}`}
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

      <select
        value={categoriaId}
        onChange={(e) => irPara(tipo, e.target.value)}
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
    </div>
  );
}
