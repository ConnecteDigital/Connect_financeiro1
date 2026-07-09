const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatDate(value: string | Date) {
  // Datas "puras" (YYYY-MM-DD, sem hora) vindas do banco não podem passar por
  // `new Date(string)`: o JS interpreta como meia-noite UTC, e formatar isso
  // no fuso local do servidor pode exibir o dia anterior ou seguinte —
  // exatamente o bug de "um dia a mais ou a menos" que víamos nas telas.
  // Fazendo a formatação por texto, sem nunca converter fuso horário.
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
