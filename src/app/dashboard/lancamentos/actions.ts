'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addWeeks, addMonths, formatISO } from 'date-fns'
import { createClient } from '@/lib/supabase/server'

const LOOKAHEAD_RECORRENCIA_FIXA = 12

function readCamposBase(formData: FormData) {
  return {
    tipo: String(formData.get('tipo') ?? 'entrada') as 'entrada' | 'saida',
    valor: Number(formData.get('valor')),
    descricao: String(formData.get('descricao') ?? '').trim(),
    data_competencia: String(formData.get('data_competencia') ?? ''),
    data_vencimento: String(formData.get('data_vencimento') ?? ''),
    cliente_id: String(formData.get('cliente_id') ?? '') || null,
    categoria_id: String(formData.get('categoria_id') ?? '') || null,
    conta_id: String(formData.get('conta_id') ?? '') || null,
    centro_de_custo_id: String(formData.get('centro_de_custo_id') ?? '') || null,
    taxas_e_juros: formData.get('taxas_e_juros') ? Number(formData.get('taxas_e_juros')) : null,
    anotacoes: String(formData.get('anotacoes') ?? '').trim() || null,
  }
}

function validar(campos: ReturnType<typeof readCamposBase>) {
  if (!campos.descricao) return 'Descrição é obrigatória.'
  if (!campos.valor || campos.valor <= 0) return 'Valor precisa ser maior que zero.'
  if (!campos.data_competencia || !campos.data_vencimento) return 'Competência e vencimento são obrigatórios.'
  if (!campos.categoria_id) return 'Categoria é obrigatória.'
  if (!campos.conta_id) return 'Conta é obrigatória.'
  return null
}

export async function createLancamento(formData: FormData) {
  const supabase = await createClient()
  const campos = readCamposBase(formData)

  const erroValidacao = validar(campos)
  if (erroValidacao) {
    redirect(`/dashboard/lancamentos/novo?erro=${encodeURIComponent(erroValidacao)}`)
  }

  const jaPago = formData.get('ja_pago') === 'on'
  const dataPagamento = jaPago
    ? String(formData.get('data_pagamento') || formatISO(new Date(), { representation: 'date' }))
    : null

  const recorrenciaAtiva = formData.get('recorrencia_ativa') === 'on'

  if (!recorrenciaAtiva) {
    const { error } = await supabase.from('lancamentos').insert({
      ...campos,
      status: jaPago ? 'pago' : 'pendente',
      data_pagamento: dataPagamento,
    })
    if (error) redirect(`/dashboard/lancamentos/novo?erro=${encodeURIComponent(error.message)}`)
  } else {
    const modo = String(formData.get('modo_recorrencia') ?? 'fixa') as 'fixa' | 'parcelada'
    const periodicidade = String(formData.get('periodicidade') ?? 'mensal') as 'semanal' | 'mensal'
    const parcelasTotal = modo === 'parcelada' ? Number(formData.get('parcelas_total')) : null

    if (modo === 'parcelada' && (!parcelasTotal || parcelasTotal < 1)) {
      redirect(`/dashboard/lancamentos/novo?erro=${encodeURIComponent('Informe a quantidade de parcelas.')}`)
    }

    const { data: recorrencia, error: erroRecorrencia } = await supabase
      .from('recorrencias')
      .insert({ modo, periodicidade, parcelas_total: parcelasTotal })
      .select('id')
      .single()

    if (erroRecorrencia || !recorrencia) {
      redirect(`/dashboard/lancamentos/novo?erro=${encodeURIComponent(erroRecorrencia?.message ?? 'Erro ao criar recorrência.')}`)
      return
    }

    const ocorrencias = modo === 'parcelada' ? parcelasTotal! : LOOKAHEAD_RECORRENCIA_FIXA
    const somaPeriodo = periodicidade === 'semanal' ? addWeeks : addMonths

    const linhas = Array.from({ length: ocorrencias }, (_, i) => ({
      ...campos,
      data_competencia: formatISO(somaPeriodo(new Date(`${campos.data_competencia}T00:00:00`), i), {
        representation: 'date',
      }),
      data_vencimento: formatISO(somaPeriodo(new Date(`${campos.data_vencimento}T00:00:00`), i), {
        representation: 'date',
      }),
      status: i === 0 && jaPago ? 'pago' : 'pendente',
      data_pagamento: i === 0 ? dataPagamento : null,
      recorrencia_id: recorrencia.id,
    }))

    const { error } = await supabase.from('lancamentos').insert(linhas)
    if (error) redirect(`/dashboard/lancamentos/novo?erro=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/dashboard')
  redirect('/dashboard/lancamentos')
}

export async function updateLancamento(id: string, formData: FormData) {
  const supabase = await createClient()
  const campos = readCamposBase(formData)

  const erroValidacao = validar(campos)
  if (erroValidacao) {
    redirect(`/dashboard/lancamentos/${id}?erro=${encodeURIComponent(erroValidacao)}`)
  }

  const jaPago = formData.get('ja_pago') === 'on'
  const dataPagamento = jaPago
    ? String(formData.get('data_pagamento') || formatISO(new Date(), { representation: 'date' }))
    : null

  const { error } = await supabase
    .from('lancamentos')
    .update({ ...campos, status: jaPago ? 'pago' : 'pendente', data_pagamento: dataPagamento })
    .eq('id', id)

  if (error) redirect(`/dashboard/lancamentos/${id}?erro=${encodeURIComponent(error.message)}`)

  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/dashboard')
  redirect('/dashboard/lancamentos')
}

export async function estornarLancamento(id: string) {
  const supabase = await createClient()
  await supabase.from('lancamentos').update({ status: 'pendente', data_pagamento: null }).eq('id', id)
  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/dashboard')
  redirect(`/dashboard/lancamentos/${id}`)
}

export async function deleteLancamento(id: string) {
  const supabase = await createClient()
  await supabase.from('lancamentos').delete().eq('id', id)
  revalidatePath('/dashboard/lancamentos')
  revalidatePath('/dashboard')
  redirect('/dashboard/lancamentos')
}
