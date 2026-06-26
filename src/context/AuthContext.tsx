// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { 
  // AuthUser
 } from '../types';
 interface AuthUser {
  id: string; name: string; email: string; staff_id: string;
  school: { name: string; logo?: string }; avatar?: string; role: 'teacher'
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  setAuth: (token: string, user: AuthUser, remember?: boolean) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

// Mock user database
const MOCK_USERS: Record<string, any> = {
  'admin@school.com': {
    id: '1',
    email: 'admin@school.com',
    name: 'Admin User',
    role: 'admin',
    school: 'Spring Hills Academy',
  },
  'teacher@school.com': {
    id: '2',
    email: 'teacher@school.com',
    name: 'Teacher User',
    role: 'teacher',
    school: 'Spring Hills Academy',
  },
  'student@school.com': {
    id: '3',
    email: 'student@school.com',
    name: 'Student User',
    role: 'student',
    school: 'Spring Hills Academy',
  },
  'parent@school.com': {
    id: '4',
    email: 'parent@school.com',
    name: 'Parent User',
    role: 'parent',
    school: 'Spring Hills Academy',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    // DEVELOPMENT MODE: Auto-login
    const DEV_MODE = true;
    const DEV_USER = 'admin@school.com';
    
    if (DEV_MODE) {
      const devToken = localStorage.getItem('af_token') || `dev_token_${Date.now()}`;
      const devUser = localStorage.getItem('af_user');
      
      if (devUser) {
        return devToken;
      } else {
        // Auto-login with mock user
        const user = MOCK_USERS[DEV_USER];
        localStorage.setItem('af_token', devToken);
        localStorage.setItem('af_user', JSON.stringify(user));
        return devToken;
      }
    }
    
    // Normal mode
    return localStorage.getItem('af_token') || sessionStorage.getItem('af_token');
  });
  
  const [user, setUser] = useState<AuthUser | null>(() => {
    // DEVELOPMENT MODE: Auto-login
    const DEV_MODE = true;
    const DEV_USER = 'admin@school.com';
    
    if (DEV_MODE) {
      const storedUser = localStorage.getItem('af_user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      } else {
        // Auto-login with mock user
        const user = MOCK_USERS[DEV_USER];
        localStorage.setItem('af_user', JSON.stringify(user));
        return user;
      }
    }
    
    // Normal mode
    const sessionUser = sessionStorage.getItem('af_user');
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch {
        return null;
      }
    }
    
    const storedUser = localStorage.getItem('af_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setAuth = (t: string, u: AuthUser, remember: boolean = false) => {
    if (remember) {
      localStorage.setItem('af_token', t);
      localStorage.setItem('af_user', JSON.stringify(u));
      sessionStorage.removeItem('af_token');
      sessionStorage.removeItem('af_user');
    } else {
      sessionStorage.setItem('af_token', t);
      sessionStorage.setItem('af_user', JSON.stringify(u));
      localStorage.removeItem('af_token');
      localStorage.removeItem('af_user');
    }
    
    setToken(t);
    setUser(u);
  };

  const clearAuth = () => {
    localStorage.removeItem('af_token');
    localStorage.removeItem('af_user');
    sessionStorage.removeItem('af_token');
    sessionStorage.removeItem('af_user');
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS[email];
        if (user && password.length >= 6) {
          const token = `mock_token_${Date.now()}_${user.id}`;
          setAuth(token, user, remember);
          resolve({ token, user });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'af_token' || e.key === 'af_user') {
        const newToken = localStorage.getItem('af_token') || sessionStorage.getItem('af_token');
        const newUser = localStorage.getItem('af_user') || sessionStorage.getItem('af_user');
        setToken(newToken);
        setUser(newUser ? JSON.parse(newUser) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        setAuth, 
        clearAuth, 
        isAuthenticated: !!token,
        login: login as (email: string, password: string, remember?: boolean) => Promise<void>,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// import { createContext, useContext, useState, type ReactNode } from 'react';
// import type { AdminUser } from '../types';

// interface AuthCtx {
//   user: AdminUser | null; token: string | null;
//   setAuth: (t: string, u: AdminUser) => void;
//   clearAuth: () => void; isAuthenticated: boolean;
// }
// const AuthContext = createContext<AuthCtx | null>(null);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [token, setToken] = useState<string | null>(() => localStorage.getItem('af_admin_token'));
//   const [user, setUser] = useState<AdminUser | null>(() => {
//     const u = localStorage.getItem('af_admin_user');
//     return u ? JSON.parse(u) : null;
//   });
//   const setAuth = (t: string, u: AdminUser) => {
//     localStorage.setItem('af_admin_token', t); localStorage.setItem('af_admin_user', JSON.stringify(u));
//     setToken(t); setUser(u);
//   };
//   const clearAuth = () => {
//     localStorage.removeItem('af_admin_token'); localStorage.removeItem('af_admin_user');
//     setToken(null); setUser(null);
//   };
//   return <AuthContext.Provider value={{ user, token, setAuth, clearAuth, isAuthenticated: !!token }}>{children}</AuthContext.Provider>;
// }
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be inside AuthProvider');
//   return ctx;
// }
