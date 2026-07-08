'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function readClienteFields(formData: FormData) {
  const tipoPessoa = String(formData.get('tipo_pessoa') ?? '')
  return {
    nome: String(formData.get('nome') ?? '').trim(),
    tipo_pessoa: tipoPessoa === 'fisica' || tipoPessoa === 'juridica' ? tipoPessoa : null,
    cpf_cnpj: String(formData.get('cpf_cnpj') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim() || null,
    telefone: String(formData.get('telefone') ?? '').trim() || null,
    anotacoes: String(formData.get('anotacoes') ?? '').trim() || null,
  }
}

export async function createCliente(formData: FormData) {
  const supabase = await createClient()
  const cliente = readClienteFields(formData)

  if (!cliente.nome) {
    redirect(`/dashboard/clientes/novo?erro=${encodeURIComponent('Nome é obrigatório.')}`)
  }

  const { error } = await supabase.from('clientes').insert(cliente)
  if (error) {
    redirect(`/dashboard/clientes/novo?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/clientes')
  redirect('/dashboard/clientes')
}

export async function updateCliente(id: string, formData: FormData) {
  const supabase = await createClient()
  const cliente = readClienteFields(formData)

  if (!cliente.nome) {
    redirect(`/dashboard/clientes/${id}?erro=${encodeURIComponent('Nome é obrigatório.')}`)
  }

  const { error } = await supabase.from('clientes').update(cliente).eq('id', id)
  if (error) {
    redirect(`/dashboard/clientes/${id}?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/clientes')
  redirect('/dashboard/clientes')
}

export async function deleteCliente(id: string) {
  const supabase = await createClient()
  await supabase.from('clientes').delete().eq('id', id)
  revalidatePath('/dashboard/clientes')
  redirect('/dashboard/clientes')
}
