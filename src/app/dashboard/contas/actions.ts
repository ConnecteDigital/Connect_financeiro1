'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCaixinha(formData: FormData) {
  const supabase = await createClient()
  const nome = String(formData.get('nome') ?? '').trim()
  const contaPaiId = String(formData.get('conta_pai_id') ?? '')

  if (!nome || !contaPaiId) {
    redirect(`/dashboard/contas/nova-caixinha?erro=${encodeURIComponent('Nome e conta são obrigatórios.')}`)
  }

  const { error } = await supabase.from('contas').insert({ nome, conta_pai_id: contaPaiId })
  if (error) {
    redirect(`/dashboard/contas/nova-caixinha?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/contas')
  revalidatePath('/dashboard')
  redirect('/dashboard/contas')
}

export async function createTransferencia(formData: FormData) {
  const supabase = await createClient()

  const contaOrigemId = String(formData.get('conta_origem_id') ?? '')
  const contaDestinoId = String(formData.get('conta_destino_id') ?? '')
  const valor = Number(formData.get('valor'))
  const data = String(formData.get('data') ?? '')
  const descricao = String(formData.get('descricao') ?? '').trim() || null

  if (!contaOrigemId || !contaDestinoId || contaOrigemId === contaDestinoId) {
    redirect(`/dashboard/contas/transferir?erro=${encodeURIComponent('Selecione duas contas diferentes.')}`)
  }
  if (!valor || valor <= 0) {
    redirect(`/dashboard/contas/transferir?erro=${encodeURIComponent('Valor precisa ser maior que zero.')}`)
  }
  if (!data) {
    redirect(`/dashboard/contas/transferir?erro=${encodeURIComponent('Informe a data.')}`)
  }

  const { error } = await supabase.from('transferencias').insert({
    conta_origem_id: contaOrigemId,
    conta_destino_id: contaDestinoId,
    valor,
    data,
    descricao,
  })

  if (error) {
    redirect(`/dashboard/contas/transferir?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/contas')
  revalidatePath('/dashboard')
  redirect('/dashboard/contas')
}
