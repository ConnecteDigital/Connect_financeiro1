# Connect Financeiro

Sistema financeiro interno da Connect — entradas e saídas por conta, caixinhas
de investimento, categorização contábil e relatórios de crescimento. Substitui
a ferramenta paga usada até aqui.

O plano completo (módulos, modelo de dados, relatórios, migração e fases) foi
revisado à parte; este repositório implementa a Fase 1 (base operacional).

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (Postgres + Auth) — projeto próprio, sem ligação com o sistema de
  clientes

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do projeto Supabase
npm run dev
```

### Configurando o Supabase

1. Crie um projeto novo em [supabase.com](https://supabase.com) chamado
   `connect-financeiro`.
2. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`
   para `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`). A `service_role key` só é necessária para
   scripts de migração de dados (`SUPABASE_SERVICE_ROLE_KEY`).
3. Rode o schema inicial e o seed, na ordem, pelo SQL Editor do Supabase (ou
   via Supabase CLI):
   - `supabase/migrations/0001_init.sql` — tabelas, views e RLS.
   - `supabase/seed.sql` — grupos/categorias contábeis migradas do sistema
     atual e as contas "Caixa da empresa" e "Investimento".
4. Crie os dois usuários (você e a Anna Clara) em **Authentication → Users** —
   ambos têm o mesmo nível de acesso, não há distinção de papel.

## Estrutura

```
src/app/login/          tela e ações de autenticação
src/app/dashboard/       shell autenticado (sidebar) e páginas por módulo
src/lib/supabase/        clients Supabase (browser, server, proxy/sessão)
src/proxy.ts             guarda de rota (redireciona não autenticado → /login)
supabase/migrations/      schema versionado
supabase/seed.sql         dados iniciais (taxonomia + contas)
```

## Estado atual (Fase 1)

- [x] Autenticação e guarda de rota
- [x] Schema completo: contas/caixinhas, transferências, categorias/grupos,
      clientes, lançamentos, recorrências, metas (fase 2)
- [x] Shell do dashboard com navegação e identidade visual (laranja/preto)
- [x] Páginas de leitura: Painel, Contas, Clientes, Lançamentos, Relatórios,
      Configurações
- [ ] Formulários de cadastro/edição (cliente, lançamento, transferência)
- [ ] Importação do histórico (CSV de Entradas/Saídas 2025–2026)
- [ ] Relatórios (DFC completa, comparativos, rankings) — Fase 2
- [ ] Metas — Fase 2/3
