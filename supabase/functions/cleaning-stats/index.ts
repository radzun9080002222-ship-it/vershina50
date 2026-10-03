// Standalone deployment. Never return or log Calendar event content or credentials.
export function monthOf(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit' }).formatToParts(now);
  return `${parts.find(p => p.type === 'year')!.value}-${parts.find(p => p.type === 'month')!.value}`;
}

export function aggregate(events: any[], now: Date) {
  const month = monthOf(now);
  const first = Date.parse(`${month}-01T00:00:00+03:00`);
  const seen = new Set<string>();
  let area = 0;
  for (const event of events) {
    if (!event.id || seen.has(event.id)) continue;
    seen.add(event.id);
    if (event.status === 'cancelled' || event.colorId !== '2' || /узнавали цену|отмен[аёе]/i.test(event.summary || '')) continue;
    const end = event.end?.dateTime ? Date.parse(event.end.dateTime) : event.end?.date ? Date.parse(`${event.end.date}T00:00:00+03:00`) - 1 : NaN;
    if (!Number.isFinite(end) || end < first || end > now.getTime()) continue;
    // The manager calculator puts the cleaning area in the title, once.
    const matches = [...String(event.summary || '').matchAll(/(\d+(?:[.,]\d+)?)\s*(?:м²|м2|м\^2|кв\.?\s*м\.?)(?!\w)/gi)];
    if (matches.length !== 1) continue;
    const value = Number(matches[0][1].replace(',', '.'));
    if (value > 0 && value <= 100000) area += value;
  }
  return { month, area: Math.round(area * 100) / 100, updatedAt: now.toISOString(), scope: 'all-cities' };
}

const env = (name: string) => Deno.env.get(name) || '';
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
async function googleToken() {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => b64(new TextEncoder().encode(JSON.stringify(value)));
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: env('GOOGLE_SERVICE_ACCOUNT_EMAIL'), scope: 'https://www.googleapis.com/auth/calendar.events.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const pem = env('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n').replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64(signature)}` }) });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error('Google authentication failed');
  return data.access_token;
}
async function database(path: string, options: RequestInit = {}) {
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(`${env('SUPABASE_URL')}/rest/v1/${path}`, { ...options, headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', ...options.headers } });
  if (!response.ok) throw new Error('Statistics database unavailable');
  return response.status === 204 ? null : response.json();
}
async function refresh() {
  const now = new Date();
  const token = await googleToken();
  const events: any[] = [];
  let page = '';
  do {
    const params = new URLSearchParams({ timeMin: `${monthOf(now)}-01T00:00:00+03:00`, timeMax: now.toISOString(), singleEvents: 'true', showDeleted: 'false', maxResults: '2500', fields: 'nextPageToken,items(id,summary,status,colorId,end)' });
    if (page) params.set('pageToken', page);
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env('GOOGLE_CALENDAR_ID'))}/events?${params}`, { headers: { authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Calendar unavailable');
    const data = await response.json();
    events.push(...(data.items || []));
    page = data.nextPageToken || '';
  } while (page);
  const snapshot = aggregate(events, now);
  await database('cleaning_stats_cache?on_conflict=id', { method: 'POST', headers: { prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: 'all-cities', snapshot }) });
  return snapshot;
}
if (typeof Deno !== 'undefined') Deno.serve(async request => {
  const headers = { 'content-type': 'application/json', 'access-control-allow-origin': 'https://vershina50.ru', 'access-control-allow-methods': 'GET, OPTIONS', 'cache-control': 'no-store' };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  try {
    if (request.method === 'POST') {
      const supplied = request.headers.get('x-stats-token');
      if (!supplied) return reply({ error: 'Unauthorized' }, 401);
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(supplied))), byte => byte.toString(16).padStart(2, '0')).join('');
      const rows = await database('cleaning_stats_auth?id=eq.refresh&select=token_hash');
      if (hash !== rows?.[0]?.token_hash) return reply({ error: 'Unauthorized' }, 401);
      return reply(await refresh());
    }
    if (request.method !== 'GET') return reply({ error: 'Method not allowed' }, 405);
    const rows = await database('cleaning_stats_cache?id=eq.all-cities&select=snapshot');
    const snapshot = rows?.[0]?.snapshot;
    if (!snapshot || snapshot.month !== monthOf(new Date()) || Date.now() - Date.parse(snapshot.updatedAt) > 36 * 3600000) return reply({ error: 'Statistics not ready' }, 503);
    // Explicit allowlist: no raw events or client details in the public response.
    return reply({ month: snapshot.month, area: snapshot.area, updatedAt: snapshot.updatedAt, scope: 'all-cities' });
  } catch { console.error('cleaning-stats failed'); return reply({ error: 'Statistics temporarily unavailable' }, 503); }
});
