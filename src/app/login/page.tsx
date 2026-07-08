import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <main className="login-shell">
      <form className="login-card" action={login}>
        <div className="login-brand">
          <span className="login-brand-mark" aria-hidden="true" />
          <span className="login-brand-name">Connect Financeiro</span>
        </div>
        <p className="login-sub">Acesso interno</p>

        <label className="login-field">
          <span>E-mail</span>
          <input type="email" name="email" required autoComplete="email" />
        </label>

        <label className="login-field">
          <span>Senha</span>
          <input type="password" name="password" required autoComplete="current-password" />
        </label>

        {erro && <p className="login-error">{erro}</p>}

        <button type="submit" className="login-submit">
          Entrar
        </button>
      </form>
    </main>
  )
}
