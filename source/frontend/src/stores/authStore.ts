import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: number;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setAuth: (token, user) => set({ accessToken: token, user }),
      logout: async () => {
        const { user, accessToken } = get();
        if (user && accessToken) {
          try {
            await axios.post('http://localhost:5054/api/v1/Auth/revoke-tokens', 
              { userId: user.id },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
          } catch (err) {
            console.error('Failed to revoke tokens on server', err);
          }
        }
        set({ accessToken: null, user: null });
        localStorage.removeItem('auth-storage');
        // Clear all cookies if any
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
