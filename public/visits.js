(() => {
  const target = document.querySelector('#visit-total');
  if (!target) return;
  const sessionKey = 'donbosco2026_visit_session';
  const validId = value => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');
  const readCookie = () => {
    try { return document.cookie.split('; ').find(value => value.startsWith(sessionKey+'='))?.slice(sessionKey.length+1); }
    catch { return null; }
  };
  function session() {
    const existing = readCookie();
    if (validId(existing)) return existing;
    let id;
    try { id = sessionStorage.getItem(sessionKey); } catch { /* Almacenamiento bloqueado. */ }
    if (!validId(id)) id = crypto.randomUUID();
    try {
      document.cookie = `${sessionKey}=${id}; Path=/; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
      if (readCookie() === id) return id;
    } catch { /* Usar sessionStorage si no se admiten cookies. */ }
    try {
      sessionStorage.setItem(sessionKey,id);
      if (sessionStorage.getItem(sessionKey) === id) return id;
    } catch { /* Solo consultar el total si no puede persistirse la sesión. */ }
    return null;
  }
  async function load() {
    try {
      const configResponse = await fetch('counter-config.json',{cache:'no-store'});
      if (!configResponse.ok) throw new Error('Counter config');
      const config = await configResponse.json();
      const id = navigator.locks ? await navigator.locks.request(sessionKey,session) : session();
      const result = await fetch(config.url, {
        method: id ? 'POST' : 'GET',
        headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, ...(id ? { 'Content-Type':'application/json' } : {}) },
        body: id ? JSON.stringify({sessionId:id}) : undefined,
        signal: AbortSignal.timeout(12000),
        cache: 'no-store',
      });
      if (!result.ok) throw new Error('Counter request');
      const {total} = await result.json();
      if (!Number.isSafeInteger(total) || total < 0) throw new Error('Counter response');
      target.textContent = new Intl.NumberFormat('es-BO').format(total);
      target.dataset.state = 'ready';
      document.querySelector('#visit-note').textContent = 'Una visita por sesión';
    } catch {
      target.textContent = '—';
      target.dataset.state = 'unavailable';
      document.querySelector('#visit-note').textContent = 'Contador temporalmente no disponible';
    }
  }
  load();
})();
