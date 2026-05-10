// ============================================================
// CONFIGURAÇÃO SUPABASE — Engs Hub
// ============================================================
const SUPABASE_URL = 'https://zxigimbhdzwhsxvjkzhx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4aWdpbWJoZHp3aHN4dmpremh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MjE1OTIsImV4cCI6MjA5Mzk5NzU5Mn0.8gEJwKv2OPgLyb1M4v7W5opye9EH--x5pXxQ4jK8IHU';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

function onAuthChange(callback) {
  db.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
