// Enquanto o projeto Supabase ainda não existe (ou as chaves não foram
// preenchidas em .env.local), usamos valores de placeholder para que os
// clients consigam ser instanciados sem derrubar a aplicação inteira. As
// chamadas de rede feitas com esses valores falham normalmente (erro de
// fetch), e cada página já trata isso como "sem conexão ainda".
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
