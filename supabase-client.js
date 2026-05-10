// ============================================================
// CONFIGURAÇÃO SUPABASE — Engs Hub
// Arquivo compartilhado entre index.html e controle.html
// ============================================================

const SUPABASE_URL  = 'https://zxigimbhdzwhsxvjkzhx.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_JYowpkP_e8A_Bu3MxuOR3A_5r2B_otM';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Retorna o usuário logado ou null
async function getUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

// Escuta mudanças de sessão (login/logout)
function onAuthChange(callback) {
  db.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
