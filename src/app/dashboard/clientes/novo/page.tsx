import { createCliente } from "../actions";
import { ClienteForm } from "../ClienteForm";

export default async function NovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <>
      <div className="page-header">
        <h1>Novo cliente</h1>
        <p>Só o nome é obrigatório — preencha o resto se fizer sentido.</p>
      </div>
      <ClienteForm action={createCliente} erro={erro} />
    </>
  );
}
