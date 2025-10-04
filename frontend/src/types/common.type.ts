export interface IUserPermissions {
    canManageDevices: boolean;
    canManagePolicies: boolean;
    canViewLogs: boolean;
    canManageUsers: boolean;
    canManageNetwork: boolean;
    canManageBlocklists: boolean;
    canManageScheduledTasks: boolean;
}

export interface IUserData {
    user: {
        loginId: string;
        userId: string;
        role: string;
    };
    permissions: IUserPermissions;
}

export interface ILoginResponse extends IUserData {
    iat: number;
    exp: number;
}