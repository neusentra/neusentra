import type { AuthProviderProps, IAuthContext, ILoginResponse, InitializeData, IUserData, IUserPermissions, SetUserDataFromTokenReturn } from "@/types";
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { axiosInstance, httpService } from "@/services";
import { API_METHODS } from "@/enums/common.enum";
import { AUTH_KEY, ENDPOINTS } from "@/constants";
import { usePreloader } from "./preloader";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<IUserData | null>();
  const [isInitialized, setIsInitialized] = useState<boolean | null>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();
  const { setPreloader } = usePreloader();

  const validateToken = useCallback((token: string): ILoginResponse | null => {
    if (!token) return null;

    try {
      const payload = jwtDecode<ILoginResponse>(token);
      const isExpired = !payload?.exp || payload.exp < Date.now() / 1000;
      return isExpired ? null : payload;
    } catch {
      return null;
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("permissions");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setUserData(null);
    setIsAuthenticated(false);
  }, []);

  const setUserDataFromToken = useCallback((
    token: string, permissions: IUserPermissions, skipLocalStorage = false
  ): SetUserDataFromTokenReturn => {
    try {
      const payload = validateToken(token);

      if (!payload) {
        return { success: false, error: "Invalid Token" };
      }

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (!skipLocalStorage) {
        localStorage.setItem(AUTH_KEY, token);
        localStorage.setItem("permissions", JSON.stringify(permissions));
      }

      setUserData({ user: payload.user, permissions });
      setIsAuthenticated(true);

      return { success: true, error: null };
    } catch (error) {
      clearAuth();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown Error",
      };
    }
  }, [validateToken, clearAuth]);

  const initializeAuth = async () => {
    setPreloader(true);

    const { data, success, error } = await httpService<InitializeData>(
      API_METHODS.GET,
      ENDPOINTS.AUTH.CHECK_INITIALIZATION
    );

    if (!success && error) {
      toast.error("Initialization check failed");
      setPreloader(false);
      return;
    }

    setIsInitialized(data?.initialized ?? false);

    if (data && !data.initialized) {
      navigate("/auth/initialize");
      setPreloader(false);
      return;
    }

    const token = localStorage.getItem(AUTH_KEY);
    const permissionsString = localStorage.getItem("permissions");

    if (token && permissionsString) {
      const payload = validateToken(token);

      if (payload) {
        const permissions = JSON.parse(permissionsString);
        setUserData({ user: payload.user, permissions });
        setIsAuthenticated(true);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        clearAuth();
      }
    }

    setPreloader(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initializeAuth() }, []);

  const value = useMemo(() => ({
    userData,
    setUserData,
    isInitialized,
    isAuthenticated,
    setIsAuthenticated,
    setUserDataFromToken,
  }), [userData, isInitialized, isAuthenticated, setUserDataFromToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};