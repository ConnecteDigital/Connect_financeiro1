"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/format";

export function FluxoDeCaixaChart({
  data,
  hojeLabel,
}: {
  data: { dia: string; saldo: number }[];
  hojeLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="var(--foreground-soft)" />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="var(--foreground-soft)"
          tickFormatter={(v) => formatCurrency(v).replace(",00", "")}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
        />
        <ReferenceLine x={hojeLabel} stroke="var(--foreground-soft)" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="saldo" stroke="var(--primary)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
