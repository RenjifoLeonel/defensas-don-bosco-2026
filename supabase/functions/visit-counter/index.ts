// El gateway verifica el JWT anónimo público. Las claves administrativas
// permanecen exclusivamente en el entorno de Supabase.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!['GET', 'POST'].includes(req.method)) return response({ error: 'Método no permitido' }, 405);
  let sessionId: string | null = null;
  if (req.method === 'POST') {
    if (!req.headers.get('content-type')?.startsWith('application/json')) return response({ error: 'Formato inválido' }, 415);
    if (Number(req.headers.get('content-length') || 0) > 1024) return response({ error: 'Solicitud demasiado grande' }, 413);
    try {
      const text = await req.text();
      if (text.length > 1024) return response({ error: 'Solicitud demasiado grande' }, 413);
      const body = JSON.parse(text);
      if (!body || typeof body.sessionId !== 'string' || !uuid.test(body.sessionId)) return response({ error: 'Sesión inválida' }, 400);
      sessionId = body.sessionId;
    } catch { return response({ error: 'Solicitud inválida' }, 400); }
  }
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Counter environment unavailable');
    const result = await fetch(`${url}/rest/v1/rpc/${sessionId ? 'record_defensas_visit' : 'read_defensas_visit_total'}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionId ? { p_session_id: sessionId } : {}),
      signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) throw new Error(`Counter database status ${result.status}`);
    const total = Number(await result.json());
    if (!Number.isSafeInteger(total) || total < 0) throw new Error('Invalid counter result');
    return response({ total });
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Counter unavailable');
    return response({ error: 'Contador temporalmente no disponible' }, 503);
  }
});
