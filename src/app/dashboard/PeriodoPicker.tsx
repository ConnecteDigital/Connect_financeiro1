"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";

const ISO = (d: Date) => format(d, "yyyy-MM-dd");

const PRESETS = [
  { key: "mes_atual", label: "Esse mês" },
  { key: "mes_anterior", label: "Mês anterior" },
  { key: "proximo_mes", label: "Próximo mês" },
  { key: "tres_meses", label: "3 meses" },
  { key: "ano_atual", label: "Esse ano" },
  { key: "ano_anterior", label: "Ano anterior" },
  { key: "personalizado", label: "Personalizado" },
] as const;

type PresetKey = (typeof PRESETS)[number]["key"];

function calcularPreset(key: PresetKey): { inicio: string; fim: string } | null {
  const hoje = new Date();
  switch (key) {
    case "mes_atual":
      return { inicio: ISO(startOfMonth(hoje)), fim: ISO(endOfMonth(hoje)) };
    case "mes_anterior": {
      const m = subMonths(hoje, 1);
      return { inicio: ISO(startOfMonth(m)), fim: ISO(endOfMonth(m)) };
    }
    case "proximo_mes": {
      const m = addMonths(hoje, 1);
      return { inicio: ISO(startOfMonth(m)), fim: ISO(endOfMonth(m)) };
    }
    case "tres_meses":
      return {
        inicio: ISO(startOfMonth(subMonths(hoje, 1))),
        fim: ISO(endOfMonth(addMonths(hoje, 1))),
      };
    case "ano_atual":
      return { inicio: ISO(startOfYear(hoje)), fim: ISO(endOfYear(hoje)) };
    case "ano_anterior": {
      const a = subYears(hoje, 1);
      return { inicio: ISO(startOfYear(a)), fim: ISO(endOfYear(a)) };
    }
    default:
      return null;
  }
}

export function PeriodoPicker({ inicio, fim }: { inicio: string; fim: string }) {
  const router = useRouter();
  const [personalizado, setPersonalizado] = useState(false);
  const [inicioCustom, setInicioCustom] = useState(inicio);
  const [fimCustom, setFimCustom] = useState(fim);

  function aplicar(key: PresetKey) {
    if (key === "personalizado") {
      setPersonalizado(true);
      return;
    }
    setPersonalizado(false);
    const intervalo = calcularPreset(key);
    if (intervalo) router.push(`/dashboard?inicio=${intervalo.inicio}&fim=${intervalo.fim}`);
  }

  return (
    <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
      <select
        defaultValue=""
        onChange={(e) => aplicar(e.target.value as PresetKey)}
        style={{
          padding: ".45rem .6rem",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          fontSize: ".85rem",
        }}
      >
        <option value="" disabled>
          Período
        </option>
        {PRESETS.map((p) => (
          <option key={p.key} value={p.key}>
            {p.label}
          </option>
        ))}
      </select>

      {personalizado && (
        <>
          <input
            type="date"
            value={inicioCustom}
            onChange={(e) => setInicioCustom(e.target.value)}
            style={{ padding: ".4rem .5rem", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <span style={{ color: "var(--foreground-soft)" }}>até</span>
          <input
            type="date"
            value={fimCustom}
            onChange={(e) => setFimCustom(e.target.value)}
            style={{ padding: ".4rem .5rem", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <button
            className="btn-primary"
            style={{ padding: ".4rem .8rem", fontSize: ".82rem" }}
            onClick={() => router.push(`/dashboard?inicio=${inicioCustom}&fim=${fimCustom}`)}
          >
            Confirmar
          </button>
        </>
      )}
    </div>
  );
}
