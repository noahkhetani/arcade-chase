import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
          });

          const data = await response.json();

          if (data.success && data.user) {
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return true;
          } else {
            set({ 
              error: data.error || 'Login failed', 
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: 'Network error during login', 
            isLoading: false 
          });
          return false;
        }
      },

      register: async (username: string, email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include',
          });

          const data = await response.json();

          if (data.success && data.user) {
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return true;
          } else {
            set({ 
              error: data.error || 'Registration failed', 
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: 'Network error during registration', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.warn('Error during logout:', error);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        });
      },

      checkAuth: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              set({ 
                user: data.user, 
                isAuthenticated: true, 
                isLoading: false 
              });
              return;
            }
          }
        } catch (error) {
          console.warn('Auth check failed:', error);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);