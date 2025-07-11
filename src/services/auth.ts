interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

class AuthService {
  private readonly API_BASE_URL = 'https://reel-wheel-api-x92jj.ondigitalocean.app';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokensToStorage(tokens: TokenResponse) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Clear any demo auth data
    localStorage.removeItem('demo_auth');
    localStorage.removeItem('demo_user');
  }

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
          grant_type: 'password'
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Login failed');
      }

      const tokens: TokenResponse = await response.json();
      this.saveTokensToStorage(tokens);
      return tokens;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<TokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Token refresh failed');
      }

      const tokens: TokenResponse = await response.json();
      this.saveTokensToStorage(tokens);
      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokensFromStorage();
      throw error;
    }
  }

  logout() {
    this.clearTokensFromStorage();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Get current user info from token (you might need to decode JWT or call API)
  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    // For now, return a basic user object
    // In a real implementation, you might decode the JWT token or call an API
    return {
      id: '1',
      email: 'admin@reelwheelsexperience.com',
      role: 'admin'
    };
  }
}

export const authService = new AuthService();
export type { LoginCredentials, TokenResponse, User };