import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { InitializeStatusApiResponse } from "@/types/api/initialize.type";
import type { ILoginResponse, IUserData } from "@/types/common.type";
import { axiosInstance, httpService } from "@/services";
import { API_METHODS } from "@/enums/common.enum";
import { AUTH_KEY, ENDPOINTS } from "@/constants";
import { usePreloader } from "./preloader";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";

interface IAuthContext {
    userData: IUserData | null;
    setUserData: (data: IUserData | null) => void;
    isInitialized: boolean | null;
    isAuthenticated: boolean;
    setIsAuthenticated: (authenticated: boolean) => void;
    error: Error | null;
    setUserDataFromToken: (token: string, skipLocalStorage?: boolean) => void;
    logout: () => Promise<void>;
}

type AuthProviderProps = {
    children: React.ReactNode;
}

const AuthContext = createContext<IAuthContext>({
    userData: null,
    setUserData: () => null,
    isInitialized: null,
    isAuthenticated: false,
    setIsAuthenticated: () => null,
    error: null,
    setUserDataFromToken: () => null,
    logout: async () => { },
});

export function AuthProvider({ children }: AuthProviderProps) {
    const [userData, setUserData] = useState<IUserData | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const navigate = useNavigate();
    const { setPreloader } = usePreloader();

    const validateToken = useCallback((token: string): ILoginResponse | null => {
        try {
            const payload = jwtDecode<ILoginResponse>(token);
            const currentTime = Math.floor(Date.now() / 1000);

            if (!payload.exp || payload.exp <= currentTime) {
                return null;
            }

            return payload;
        } catch (err) {
            console.error('Token decode error:', err);
            return null;
        }
    }, []);


    const clearAuth = useCallback(() => {
        localStorage.removeItem(AUTH_KEY);
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUserData(null);
        setIsAuthenticated(false);
    }, [setUserData, setIsAuthenticated]);

    useEffect(() => {
        const checkInitialization = async () => {
            setPreloader(true);
            try {
                const response = await httpService<InitializeStatusApiResponse>(
                    API_METHODS.GET,
                    ENDPOINTS.initializeStatus,
                );

                const { initialized } = response.data.data;
                setIsInitialized(initialized);

                if (initialized) {
                    const token = localStorage.getItem(AUTH_KEY);

                    if (token) {
                        const payload = validateToken(token);

                        if (payload) {
                            setUserData({ user: payload.user });
                            setIsAuthenticated(true);
                            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        } else {
                            clearAuth();
                        }
                    } else {
                        setIsAuthenticated(false);
                    }
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error('Failed to check initialization')
                );
            } finally {
                setPreloader(false);
            }
        };

        checkInitialization();
    }, [validateToken, clearAuth, setPreloader]);

    const setUserDataFromToken = useCallback((token: string, skipLocalStorage = false) => {
        try {
            const payload = validateToken(token);

            if (!payload) {
                throw new Error('Token is expired or invalid');
            }

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            if (!skipLocalStorage) {
                localStorage.setItem(AUTH_KEY, token);
            }

            setUserData({ user: payload.user });
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Invalid token'));
            clearAuth();
            navigate('/login');
        }
    }, [navigate, validateToken, clearAuth]);

    const logout = useCallback(async () => {
        try {
            await httpService<InitializeStatusApiResponse>(
                API_METHODS.POST,
                ENDPOINTS.logout,
                undefined,
                undefined
            );
        } catch (err) {
            console.error('Logout request failed:', err);
        } finally {
            clearAuth();
            navigate('/login');
        }
    }, [navigate, clearAuth]);


    const value = useMemo(() => ({
        userData,
        setUserData,
        isInitialized,
        isAuthenticated,
        setIsAuthenticated,
        error,
        setUserDataFromToken,
        logout,
    }), [userData, isInitialized, isAuthenticated, error, setUserDataFromToken, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}