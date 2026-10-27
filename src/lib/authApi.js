// Empty VITE_URL uses same-origin /auth proxy (Vite/Vercel → Fly backend).
const API_BASE_URL = import.meta.env.VITE_URL ?? '';

async function parseJsonResponse(response) {
  const responseClone = response.clone();
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    console.error('Response status:', response.status);
    try {
      console.error('Response text:', await responseClone.text());
    } catch (textError) {
      console.error('Could not read response text:', textError);
    }
    throw new Error('Server returned invalid response. Please check if the server is running.');
  }
}

function authHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...extra,
  };
}

export const authApi = {
  async signUp(email, password, username) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password, username }),
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Sign up failed');
    }
    return data;
  },

  async signIn(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Sign in failed');
    }
    return data;
  },

  async signOut(accessToken) {
    const headers = authHeaders();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    // Backend signout is best-effort; local session clear is the source of truth.
    if (!response.ok) {
      try {
        const data = await response.json();
        console.warn('Sign out request failed:', data.error || response.status);
      } catch {
        console.warn('Sign out request failed:', response.status);
      }
    }

    return { message: 'Sign out successful' };
  },

  async getCurrentUser(accessToken) {
    if (!accessToken) {
      throw new Error('Auth session missing!');
    }

    const headers = authHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    // Fly backend currently ignores the bearer token, so treat 401 as
    // "use the locally stored session user" instead of hard-failing.
    if (response.status === 401) {
      const error = new Error('Auth session missing!');
      error.code = 'BACKEND_SESSION_MISSING';
      throw error;
    }

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user');
    }
    return data;
  },
};
