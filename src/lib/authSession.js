const STORAGE_KEY = 'prem-stats.auth';

export function loadAuthSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.session?.access_token) return null;

    const expiresAt = Number(parsed.session.expires_at);
    if (Number.isFinite(expiresAt) && expiresAt * 1000 <= Date.now()) {
      clearAuthSession();
      return null;
    }

    return parsed;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession({ user, session }) {
  if (!session?.access_token || !user) {
    clearAuthSession();
    return null;
  }

  const payload = { user, session };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken() {
  return loadAuthSession()?.session?.access_token || null;
}
