/**
 * Token Manager - Singleton pattern for managing access token in memory
 * SECURITY: Storing token in memory prevents XSS attacks via localStorage
 */
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private listeners: Array<(token: string | null) => void> = [];

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set access token and notify listeners
   */
  setToken(token: string | null): void {
    this.accessToken = token;
    this.notifyListeners(token);
  }

  /**
   * Clear access token
   */
  clearToken(): void {
    this.setToken(null);
  }

  /**
   * Subscribe to token changes
   */
  subscribe(listener: (token: string | null) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of token change
   */
  private notifyListeners(token: string | null): void {
    this.listeners.forEach((listener) => listener(token));
  }
}

export const tokenManager = TokenManager.getInstance();
