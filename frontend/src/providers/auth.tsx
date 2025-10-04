import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import type {
  ILoginResponse,
  IUserData,
  IUserPermissions,
} from "@/types/common.type";
import { axiosInstance, httpService } from "@/services";
import { API_METHODS } from "@/enums/common.enum";
import { AUTH_KEY, ENDPOINTS,  } from "@/constants";
import { usePreloader } from "./preloader";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import type { InitializeData } from "@/types/api/initialize.type";

interface IAuthContext {
  userData: IUserData | null;
  setUserData: (data: IUserData | null) => void;
  isInitialized: boolean | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
  error: Error | null;
  setUserDataFromToken: (
    token: string,
    permissions: IUserPermissions,
    skipLocalStorage?: boolean
  ) => void;
}

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<IAuthContext>({
  userData: null,
  setUserData: () => {},
  isInitialized: null,
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  error: null,
  setUserDataFromToken: () => {},
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();
  const { setPreloader } = usePreloader();

  const validateToken = useCallback((token: string): ILoginResponse | null => {
    if (!token) return null;

    try {
      const payload = jwtDecode<ILoginResponse>(token);

      const isExpired = !payload?.exp || payload.exp < Date.now() / 1000;
      if (isExpired) return null;

      return payload;
    } catch (err) {
      console.error("Token decode error:", err);
      return null;
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("permissions");
    delete axiosInstance.defaults.headers.common["Authorization"];
    setUserData(null);
    setIsAuthenticated(false);
  }, [setUserData, setIsAuthenticated]);

  useEffect(() => {
    const initializeAuth = async () => {
      setPreloader(true);
      try {
        const { data, success } = await httpService<InitializeData>(
          API_METHODS.GET,
          ENDPOINTS.AUTH.CHECK_INITIALIZATION
        );

        if (!success) throw new Error('Initialization check failed');

        setIsInitialized(data.initialized);


        if (!data.initialized) { 
          navigate('/auth/initialize');
        }

          const token = localStorage.getItem(AUTH_KEY);
          const permissionsString = localStorage.getItem("permissions");

          if (token && permissionsString) {
            const payload = validateToken(token);

            if (payload) {
              const permissions = JSON.parse(permissionsString);
              setUserData({ user: payload.user, permissions });
              setIsAuthenticated(true);
              axiosInstance.defaults.headers.common["Authorization"] =
                `Bearer ${token}`;
            } else {
              clearAuth();
            }
          } else {
            setIsAuthenticated(false);
          }
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to check initialization")
        );
      } finally {
        setPreloader(false);
      }
    };

    initializeAuth();
  }, []);

  const setUserDataFromToken = useCallback(
    (
      token: string,
      permissions: IUserPermissions,
      skipLocalStorage = false
    ) => {
      try {
        const payload = validateToken(token);

        if (!payload) {
          throw new Error("Token is expired or invalid");
        }

        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${token}`;

        if (!skipLocalStorage) {
          localStorage.setItem(AUTH_KEY, token);
          localStorage.setItem("permissions", JSON.stringify(permissions));
        }

        setUserData({ user: payload.user, permissions });
        setIsAuthenticated(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Invalid token"));
        console.error('err', err)
        clearAuth();
      }
    },
    [navigate, validateToken, clearAuth]
  );

  const value = useMemo(
    () => ({
      userData,
      setUserData,
      isInitialized,
      isAuthenticated,
      setIsAuthenticated,
      error,
      setUserDataFromToken,
    }),
    [
      userData,
      isInitialized,
      isAuthenticated,
      error,
      setUserDataFromToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
