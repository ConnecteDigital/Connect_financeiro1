import Link from "next/link";
import { startOfMonth, endOfMonth, format, eachDayOfInterval, parseISO, isValid } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { FluxoDeCaixaChart } from "./FluxoDeCaixaChart";
import { LancamentosList, type LinhaLancamento } from "./LancamentosList";
import { PeriodoPicker } from "./PeriodoPicker";

const ISO = (d: Date) => format(d, "yyyy-MM-dd");

type LancamentoBruto = {
  id: string;
  valor: number;
  descricao: string;
  status: "pendente" | "pago";
  status_efetivo: "pendente" | "pago" | "vencido";
  data_competencia: string;
  data_vencimento: string;
  clientes: { nome: string } | null;
};

function kpiCard(label: string, valor: string, previsto?: string, cor?: string) {
  return (
    <div className="card" key={label}>
      <p style={{ margin: "0 0 .3rem", fontSize: ".8rem", color: "var(--foreground-soft)" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: cor }}>{valor}</p>
      {previsto && (
        <p style={{ margin: ".2rem 0 0", fontSize: ".76rem", color: "var(--foreground-soft)" }}>
          Previsto: {previsto}
        </p>
      )}
    </div>
  );
}

function periodoValido(v: string | undefined): Date | null {
  if (!v) return null;
  const d = parseISO(v);
  return isValid(d) ? d : null;
}

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const supabase = await createClient();

  const { inicio, fim } = await searchParams;
  const hoje = new Date();
  const inicioMes = periodoValido(inicio) ?? startOfMonth(hoje);
  const fimMes = periodoValido(fim) ?? endOfMonth(hoje);
  const isoInicio = ISO(inicioMes);
  const isoFim = ISO(fimMes);
  const periodoLabel = `${formatDate(isoInicio)} – ${formatDate(isoFim)}`;

  const [
    { data: contas, error: contasError },
    { data: entradasMes },
    { data: saidasMes },
    { data: vencidos },
    { data: transferenciasMes },
    { data: historicoPago },
  ] = await Promise.all([
    supabase.from("v_saldo_contas").select("conta_id, nome, conta_pai_id, saldo").is("conta_pai_id", null),
    supabase
      .from("v_lancamentos")
      .select("id, valor, descricao, status, status_efetivo, data_competencia, data_vencimento, clientes(nome)")
      .eq("tipo", "entrada")
      .or(
        `and(data_vencimento.gte.${isoInicio},data_vencimento.lte.${isoFim}),and(data_competencia.gte.${isoInicio},data_competencia.lte.${isoFim})`
      )
      .order("data_competencia", { ascending: true }),
    supabase
      .from("v_lancamentos")
      .select("id, valor, descricao, status, status_efetivo, data_competencia, data_vencimento, clientes(nome)")
      .eq("tipo", "saida")
      .or(
        `and(data_vencimento.gte.${isoInicio},data_vencimento.lte.${isoFim}),and(data_competencia.gte.${isoInicio},data_competencia.lte.${isoFim})`
      )
      .order("data_competencia", { ascending: true }),
    supabase.from("v_lancamentos").select("valor").eq("status_efetivo", "vencido"),
    supabase.from("transferencias").select("valor").gte("data", isoInicio).lte("data", isoFim),
    supabase
      .from("lancamentos")
      .select("tipo, valor, data_competencia")
      .eq("status", "pago")
      .lte("data_competencia", isoFim)
      .order("data_competencia", { ascending: true }),
  ]);

  if (contasError) {
    return (
      <>
        <div className="page-header">
          <h1>Painel</h1>
          <p>Visão geral do caixa da empresa.</p>
        </div>
        <p className="placeholder-note">
          Ainda sem conexão com o Supabase — assim que as chaves estiverem configuradas, o painel
          completo aparece aqui.
        </p>
      </>
    );
  }

  const entradas = (entradasMes ?? []) as unknown as LancamentoBruto[];
  const saidas = (saidasMes ?? []) as unknown as LancamentoBruto[];

  const somaSe = (linhas: LancamentoBruto[], pred: (l: LancamentoBruto) => boolean) =>
    linhas.filter(pred).reduce((acc, l) => acc + Number(l.valor), 0);

  // Fórmulas conferidas contra o sistema atual: recebidos usa vencimento pro
  // previsto e competência pro realizado; despesas usa competência pros dois.
  const recebidoRealizado = somaSe(
    entradas,
    (l) => l.status === "pago" && l.data_competencia >= isoInicio && l.data_competencia <= isoFim
  );
  const recebidoPrevisto = somaSe(
    entradas,
    (l) => l.data_vencimento >= isoInicio && l.data_vencimento <= isoFim
  );
  const despesaRealizada = somaSe(
    saidas,
    (l) => l.status === "pago" && l.data_competencia >= isoInicio && l.data_competencia <= isoFim
  );
  const despesaPrevista = somaSe(
    saidas,
    (l) => l.data_competencia >= isoInicio && l.data_competencia <= isoFim
  );

  const vencidoTotal = (vencidos ?? []).reduce((acc, l) => acc + Number(l.valor), 0);
  const transferenciaTotal = (transferenciasMes ?? []).reduce((acc, t) => acc + Number(t.valor), 0);

  const contasPrincipais = contas ?? [];
  const saldoAtual = contasPrincipais.reduce((acc, c) => acc + Number(c.saldo), 0);

  // Fluxo de caixa acumulado: soma tudo que já foi pago até cada dia do mês,
  // partindo do saldo total atual das contas.
  const movimentos = (historicoPago ?? []) as { tipo: "entrada" | "saida"; valor: number; data_competencia: string }[];
  const saldoAcumuladoPorDia = new Map<string, number>();
  let acumulado = 0;
  for (const m of movimentos) {
    acumulado += m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor);
    saldoAcumuladoPorDia.set(m.data_competencia, acumulado);
  }
  const fimGrafico = hoje < inicioMes ? inicioMes : hoje < fimMes ? hoje : fimMes;
  const dias = eachDayOfInterval({ start: inicioMes, end: fimGrafico });
  const datasConhecidas = [...saldoAcumuladoPorDia.keys()].sort();
  const chartData: { dia: string; saldo: number }[] = [];
  let ultimoValorConhecido = 0;
  for (const dia of dias) {
    const iso = ISO(dia);
    for (const dataChave of datasConhecidas) {
      if (dataChave > iso) break;
      ultimoValorConhecido = saldoAcumuladoPorDia.get(dataChave)!;
    }
    chartData.push({ dia: format(dia, "dd/MM"), saldo: ultimoValorConhecido });
  }

  // O sistema atual mostra e ordena "Contas a receber/pagar" pela data de
  // COMPETÊNCIA, não vencimento (conferido com dados reais: a mensalidade da
  // POA 24H tem competência 10/07 e vencimento 11/07, e aparece no dia 10 lá).
  const mapLinha = (l: LancamentoBruto): LinhaLancamento => ({
    id: l.id,
    data: l.data_competencia,
    descricao: l.descricao,
    contraparte: l.clientes?.nome ?? null,
    valor: Number(l.valor),
    status_efetivo: l.status_efetivo,
  });

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: ".8rem" }}>
        <div>
          <h1>Painel</h1>
          <p>Visão geral do caixa da empresa — {periodoLabel}.</p>
        </div>
        <PeriodoPicker inicio={isoInicio} fim={isoFim} />
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "1.2rem",
        }}
      >
        {kpiCard("Saldo atual", formatCurrency(saldoAtual))}
        {kpiCard(
          "Recebidos",
          formatCurrency(recebidoRealizado),
          formatCurrency(recebidoPrevisto),
          "var(--positive)"
        )}
        {kpiCard(
          "Despesas",
          formatCurrency(despesaRealizada),
          formatCurrency(despesaPrevista),
          "var(--negative)"
        )}
        {kpiCard("Vencidos", formatCurrency(vencidoTotal), undefined, "var(--warning)")}
        {kpiCard("Transferências", formatCurrency(transferenciaTotal))}
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "minmax(240px, 1fr) minmax(0, 1.6fr)",
          marginBottom: "1rem",
        }}
      >
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".7rem" }}>
            <h2 style={{ margin: 0, fontSize: "1rem" }}>Todas as Contas</h2>
            <Link href="/dashboard/contas" className="btn-secondary" style={{ padding: ".35rem .7rem", fontSize: ".8rem" }}>
              Gerenciar
            </Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
            <tbody>
              {contasPrincipais.map((conta) => (
                <tr key={conta.conta_id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: ".5rem 0" }}>
                    <Link href="/dashboard/contas">{conta.nome}</Link>
                  </td>
                  <td style={{ padding: ".5rem 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(Number(conta.saldo))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid var(--foreground-soft)" }}>
                <td style={{ padding: ".5rem 0", fontWeight: 700 }}>Saldo</td>
                <td style={{ padding: ".5rem 0", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {formatCurrency(saldoAtual)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="card">
          <h2 style={{ margin: "0 0 .5rem", fontSize: "1rem" }}>Fluxo de Caixa</h2>
          <FluxoDeCaixaChart data={chartData} hojeLabel={format(hoje, "dd/MM")} />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <LancamentosList
          titulo="Contas a receber"
          contraparteLabel="Cliente"
          addHref="/dashboard/lancamentos/novo"
          linhas={entradas.map(mapLinha)}
        />
        <LancamentosList
          titulo="Contas a pagar"
          contraparteLabel="Fornecedor"
          addHref="/dashboard/lancamentos/novo"
          linhas={saidas.map(mapLinha)}
        />
      </div>
    </>
  );
}
