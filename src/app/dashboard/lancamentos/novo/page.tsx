import { createClient } from "@/lib/supabase/server";
import { createLancamento } from "../actions";
import { LancamentoForm } from "../LancamentoForm";

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createClient();

  const [{ data: clientes }, { data: categoriasRaw }, { data: contas }, { data: centrosDeCusto }] =
    await Promise.all([
      supabase.from("clientes").select("id, nome").order("nome"),
      supabase
        .from("categorias")
        .select("id, nome, grupos_categoria(secao)")
        .eq("ativa", true)
        .order("nome"),
      supabase.from("contas").select("id, nome, conta_pai_id").order("nome"),
      supabase.from("centros_de_custo").select("id, nome").order("nome"),
    ]);

  const categorias =
    categoriasRaw?.map((c) => ({
      id: c.id,
      nome: c.nome,
      secao: (c.grupos_categoria as unknown as { secao: string } | null)?.secao ?? "",
    })) ?? [];

  return (
    <>
      <div className="page-header">
        <h1>Novo lançamento</h1>
        <p>Entrada ou saída, com competência, vencimento e recorrência opcional.</p>
      </div>
      <LancamentoForm
        action={createLancamento}
        clientes={clientes ?? []}
        categorias={categorias}
        contas={contas ?? []}
        centrosDeCusto={centrosDeCusto ?? []}
        erro={erro}
      />
    </>
  );
}
