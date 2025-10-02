
export interface IUserData {
    user: {
        loginId: string;
        userId: string;
        role: string;
        permissions: {
            can_manage_devices: boolean;
            can_manage_policies: boolean;
            can_view_logs: boolean;
            can_manage_users: boolean;
            can_manage_network: boolean;
            can_manage_blocklists: boolean;
            can_manage_scheduled_tasks: boolean;
        };
    };
}

export interface ILoginResponse extends IUserData {
    iat: number;
    exp: number;
}