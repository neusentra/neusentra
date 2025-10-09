export const USER_COUNT_QUERY = `
    SELECT COUNT(*) AS count
    FROM neusentra.users u;
`;

export const CREATE_SUPERADMIN_QUERY = `
    INSERT INTO neusentra.users (fullname, username, password_hash, role_id)
    VALUES (
        $1,
        $2,
        $3,
        (SELECT id FROM neusentra.roles WHERE name = 'superadmin' LIMIT 1)
    )
    RETURNING id;
`;

export const GET_SUPERADMIN_PERMISSION_QUERY = `
    SELECT json_build_object(
    'canManageDevices',         rp.can_manage_devices,
    'canManagePolicies',        rp.can_manage_policies,
    'canViewLogs',              rp.can_view_logs,
    'canManageUsers',           rp.can_manage_users,
    'canManageNetwork',         rp.can_manage_network,
    'canManageBlocklists',      rp.can_manage_blocklists,
    'canManageScheduledTasks',  rp.can_manage_scheduled_tasks
    ) AS permissions
    FROM neusentra.roles r
    INNER JOIN neusentra.role_permissions rp ON r.id = rp.role_id
    WHERE r.name = 'superadmin'
    LIMIT 1;
`;