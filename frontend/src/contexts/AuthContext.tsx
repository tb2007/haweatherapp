import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';

type AuthState = { username: string | null; loading: boolean };
type AuthCtx = AuthState & { login: (u: string, p: string) => Promise<void>; logout: () => Promise<void> };

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ username: null, loading: true });

  useEffect(() => {
    api.me()
      .then((r) => setState({ username: r.data.username, loading: false }))
      .catch(() => setState({ username: null, loading: false }));
  }, []);

  const login = async (username: string, password: string) => {
    await api.login(username, password);
    setState({ username, loading: false });
  };

  const logout = async () => {
    await api.logout();
    setState({ username: null, loading: false });
  };

  return <Ctx.Provider value={{ ...state, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
