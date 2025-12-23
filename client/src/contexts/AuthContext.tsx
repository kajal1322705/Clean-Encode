import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { 
  type UserRoleType, 
  type ModuleType, 
  type PermissionType,
  hasModuleAccess,
  hasPermission,
  getModulesForRole,
  isHORole,
  isDealerRole,
  UserRole
} from "@shared/schema";

interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRoleType;
  dealerId?: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  canAccessModule: (module: ModuleType) => boolean;
  canPerformAction: (module: ModuleType, permission: PermissionType) => boolean;
  getAccessibleModules: () => ModuleType[];
  isHO: () => boolean;
  isDealer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "zforce_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string, role?: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
        credentials: "include",
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success) {
        const authUser: AuthUser = {
          id: data.user?.id || "demo-user",
          username: data.user?.username || username,
          name: data.user?.name || username,
          role: (role as UserRoleType) || UserRole.DEALER_PRINCIPAL,
          dealerId: data.user?.dealerId,
          email: data.user?.email,
        };
        setUser(authUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const canAccessModule = useCallback((module: ModuleType): boolean => {
    if (!user) return false;
    return hasModuleAccess(user.role, module);
  }, [user]);

  const canPerformAction = useCallback((module: ModuleType, permission: PermissionType): boolean => {
    if (!user) return false;
    return hasPermission(user.role, module, permission);
  }, [user]);

  const getAccessibleModules = useCallback((): ModuleType[] => {
    if (!user) return [];
    return getModulesForRole(user.role);
  }, [user]);

  const isHO = useCallback((): boolean => {
    if (!user) return false;
    return isHORole(user.role);
  }, [user]);

  const isDealer = useCallback((): boolean => {
    if (!user) return false;
    return isDealerRole(user.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        canAccessModule,
        canPerformAction,
        getAccessibleModules,
        isHO,
        isDealer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
