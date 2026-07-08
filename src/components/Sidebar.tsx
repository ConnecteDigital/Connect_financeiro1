"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Users,
  ArrowLeftRight,
  BarChart3,
  Settings,
} from "lucide-react";
import { logout } from "@/app/login/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/dashboard/contas", label: "Contas", icon: Wallet },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/lancamentos", label: "Lançamentos", icon: ArrowLeftRight },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
        <span className="app-sidebar-mark" aria-hidden="true" />
        <span className="app-sidebar-name">Connect Financeiro</span>
      </div>

      <ul className="app-nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} data-active={isActive}>
                <Icon size={17} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="app-sidebar-footer">
        {userEmail && <span>{userEmail}</span>}
        <form action={logout}>
          <button type="submit">Sair</button>
        </form>
      </div>
    </aside>
  );
}
