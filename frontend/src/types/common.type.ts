export interface IUserPermissions {
    canManageDevices: boolean;
    canManagePolicies: boolean;
    canViewLogs: boolean;
    canManageUsers: boolean;
    canManageNetwork: boolean;
    canManageBlocklists: boolean;
    canManageScheduledTasks: boolean;
}

export type Role = 'superadmin' | 'admin' | 'user'

export interface User {
    loginId: string;
    userId: string;
    role: Role;
}

export interface IUserData {
    user?: User | null;
    permissions?: IUserPermissions | null;
}

export interface ILoginResponse extends IUserData {
    iat: number;
    exp: number;
}