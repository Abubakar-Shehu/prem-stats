// API service for authentication via backend server
const API_BASE_URL = import.meta.env.VITE_URL || 'https://server-abu.vercel.app';

export const authApi = {
  // Sign up user
  async signUp(email, password, username) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });

    // Clone BEFORE consuming the body!
    const responseClone = response.clone();

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      console.error('Response status:', response.status);
      try {
        const responseText = await responseClone.text();
        console.error('Response text:', responseText);
      } catch (textError) {
        console.error('Could not read response text:', textError);
      }
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
      // Clone the response to read the text without consuming the original stream
      const responseClone = response.clone();
      try {
        const responseText = await responseClone.text();
        console.error('Response text:', responseText);
      } catch (textError) {
        console.error('Could not read response text:', textError);
      }
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
