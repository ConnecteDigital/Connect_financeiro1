import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateLancamento, estornarLancamento, deleteLancamento } from "../actions";
import { LancamentoForm } from "../LancamentoForm";

export default async function EditarLancamentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;
  const supabase = await createClient();

  const [{ data: lancamento }, { data: clientes }, { data: categoriasRaw }, { data: contas }, { data: centrosDeCusto }] =
    await Promise.all([
      supabase.from("lancamentos").select("*").eq("id", id).single(),
      supabase.from("clientes").select("id, nome").order("nome"),
      supabase
        .from("categorias")
        .select("id, nome, ativa, grupos_categoria(secao)")
        .order("nome"),
      supabase.from("contas").select("id, nome, conta_pai_id").order("nome"),
      supabase.from("centros_de_custo").select("id, nome").order("nome"),
    ]);

  if (!lancamento) notFound();

  const categorias =
    categoriasRaw
      ?.filter((c) => c.ativa || c.id === lancamento.categoria_id)
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        secao: (c.grupos_categoria as unknown as { secao: string } | null)?.secao ?? "",
      })) ?? [];

  const updateLancamentoComId = updateLancamento.bind(null, id);
  const estornarLancamentoComId = estornarLancamento.bind(null, id);
  const deleteLancamentoComId = deleteLancamento.bind(null, id);

  return (
    <>
      <div className="page-header">
        <h1>{lancamento.descricao}</h1>
        <p>Editar lançamento.</p>
      </div>
      <LancamentoForm
        action={updateLancamentoComId}
        clientes={clientes ?? []}
        categorias={categorias}
        contas={contas ?? []}
        centrosDeCusto={centrosDeCusto ?? []}
        lancamento={lancamento}
        erro={erro}
      />
      <div style={{ display: "flex", gap: ".7rem", marginTop: "1rem" }}>
        {lancamento.status === "pago" && (
          <form action={estornarLancamentoComId}>
            <button type="submit" className="btn-secondary">
              Estornar
            </button>
          </form>
        )}
        <form action={deleteLancamentoComId}>
          <button type="submit" className="btn-danger">
            Excluir lançamento
          </button>
        </form>
      </div>
    </>
  );
}
