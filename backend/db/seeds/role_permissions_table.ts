import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex.raw(`
        INSERT INTO role_permissions (role_id, can_manage_devices, can_manage_policies, can_view_logs, can_manage_users, can_manage_network, can_manage_blocklists, can_manage_scheduled_tasks)
        SELECT id, true, true, true, true, true, true, true FROM roles WHERE name = 'superadmin';

        INSERT INTO role_permissions (role_id, can_manage_devices, can_manage_policies, can_view_logs, can_manage_users, can_manage_network, can_manage_blocklists, can_manage_scheduled_tasks)
        SELECT id, true, true, true, true, false, true, false FROM roles WHERE name = 'admin';

        INSERT INTO role_permissions (role_id, can_manage_devices, can_manage_policies, can_view_logs, can_manage_users, can_manage_network, can_manage_blocklists, can_manage_scheduled_tasks)
        SELECT id, false, false, true, false, false, false, false FROM roles WHERE name = 'user';
    `);
};
