import type { IUserData, IUserPermissions } from "../common.type";

export interface IAuthContext {
    userData?: IUserData | null;
    setUserData: (data: IUserData | null) => void;
    isInitialized?: boolean | null;
    isAuthenticated?: boolean;
    setIsAuthenticated: (authenticated: boolean) => void;
    setUserDataFromToken: (
        token: string,
        permissions: IUserPermissions,
        skipLocalStorage?: boolean
    ) => { success: boolean; error: string | null };
}

export type AuthProviderProps = {
    children: React.ReactNode;
};

export interface SetUserDataFromTokenReturn {
    success: boolean;
    error: string | null
}