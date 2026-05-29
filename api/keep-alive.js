// api/keep-alive.js
// Vercel Serverless Function — Supabase Keep-Alive
// Chamada pelo Cron Job a cada 3 dias para evitar que o projeto Supabase pause

export default async function handler(req, res) {
      // Proteção: aceita apenas chamadas do Vercel Cron (Authorization header)
  const authHeader = req.headers['authorization'];
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
              return res.status(401).json({ error: 'Unauthorized' });
      }

  const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
          return res.status(500).json({ error: 'Missing Supabase env vars' });
  }

  try {
          // Faz um health-check na API do Supabase para manter o projeto ativo
        // Usando o endpoint de health que sempre retorna 200
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                  method: 'HEAD',
                  headers: {
                              'apikey': supabaseKey,
                              'Authorization': `Bearer ${supabaseKey}`,
                  },
        });

        const timestamp = new Date().toISOString();
          console.log(`[keep-alive] Supabase ping at ${timestamp} — status: ${response.status}`);

        return res.status(200).json({
                  ok: true,
                  timestamp,
                  supabaseStatus: response.status,
                  message: 'Supabase keep-alive ping sent successfully',
        });
  } catch (error) {
          console.error('[keep-alive] Error pinging Supabase:', error);
          return res.status(500).json({ error: error.message });
  }
}
