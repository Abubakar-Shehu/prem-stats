const PLACEHOLDER_URLS = new Set([
  '',
  'your_existing_api_url_here',
  'your_backend_api_url_here',
]);

/**
 * Base URL for browser fetches to `/api/*` and `/auth/*`.
 *
 * Always prefer same-origin so:
 * - Vite proxies `/auth` → Fly in development
 * - Vercel rewrites `/auth` → Fly in production
 * - `/api/prem*` stays on this app (not the Fly auth host)
 *
 * If `VITE_URL` is set to the Fly auth backend (a common misconfig), ignore it —
 * calling Fly cross-origin with `credentials: 'include'` fails CORS, and prem
 * data is not served from that host.
 */
export function getApiBaseUrl() {
  const raw = String(import.meta.env.VITE_URL ?? '')
    .trim()
    .replace(/\/$/, '');

  if (!raw || PLACEHOLDER_URLS.has(raw)) {
    return '';
  }

  try {
    const host = new URL(raw).hostname;
    if (host === 'backend-nkn2pg.fly.dev' || host.endsWith('.fly.dev')) {
      return '';
    }
  } catch {
    return '';
  }

  return raw;
}
