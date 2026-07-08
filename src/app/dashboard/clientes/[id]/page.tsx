import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCliente, deleteCliente } from "../actions";
import { ClienteForm } from "../ClienteForm";

export default async function EditarClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const { erro } = await searchParams;
  const supabase = await createClient();

  const { data: cliente } = await supabase.from("clientes").select("*").eq("id", id).single();

  if (!cliente) notFound();

  const updateClienteWithId = updateCliente.bind(null, id);
  const deleteClienteWithId = deleteCliente.bind(null, id);

  return (
    <>
      <div className="page-header">
        <h1>{cliente.nome}</h1>
        <p>Editar cadastro do cliente.</p>
      </div>
      <ClienteForm action={updateClienteWithId} cliente={cliente} erro={erro} />
      <form action={deleteClienteWithId} style={{ marginTop: "1rem" }}>
        <button type="submit" className="btn-danger">
          Excluir cliente
        </button>
      </form>
    </>
  );
}
