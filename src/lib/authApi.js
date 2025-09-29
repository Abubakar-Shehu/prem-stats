// API service for authentication via backend server
const API_BASE_URL = import.meta.env.VITE_URL || 'https://backend-nkn2pg.fly.dev';

export const authApi = {
  // Sign up user
  async signUp(email, password, username) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      console.error('Response status:', response.status);
      console.error('Response text:', await response.text());
      throw new Error('Server returned invalid response. Please check if the server is running.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Sign up failed');
    }

    return data;
  },

  // Sign in user
  async signIn(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      console.error('Response status:', response.status);
      console.error('Response text:', await response.text());
      throw new Error('Server returned invalid response. Please check if the server is running.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Sign in failed');
    }

    return data;
  },

  // Sign out user
  async signOut() {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sign out failed');
    }

    return data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user');
    }

    return data;
  }
};
