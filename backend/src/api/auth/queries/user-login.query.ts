export const FETCH_USER_BY_USERNAME_QUERY = `
  SELECT 
    u.id, 
    u.fullname, 
    u.username, 
    u.password_hash, 
    r.name AS role,
    json_build_object(
      'can_manage_devices', rp.can_manage_devices,
      'can_manage_policies', rp.can_manage_policies,
      'can_view_logs', rp.can_view_logs,
      'can_manage_users', rp.can_manage_users,
      'can_manage_network', rp.can_manage_network,
      'can_manage_blocklists', rp.can_manage_blocklists,
      'can_manage_scheduled_tasks', rp.can_manage_scheduled_tasks
    ) AS permissions
  FROM neusentra.users u
  JOIN neusentra.roles r ON u.role_id = r.id
  JOIN neusentra.role_permissions rp ON r.id = rp.role_id
  WHERE u.username = $1
  LIMIT 1;
`;