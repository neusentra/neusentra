import type { Knex } from "knex";
import { seed } from '../seeds/role_permissions_table';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable("role_permissions", (table: any) => {
        table.uuid("role_id").primary().references("id").inTable("roles").onDelete("CASCADE");
        table.boolean("can_manage_devices").defaultTo(false);
        table.boolean("can_manage_policies").defaultTo(false);
        table.boolean("can_view_logs").defaultTo(false);
        table.boolean("can_manage_users").defaultTo(false);
        table.boolean("can_manage_network").defaultTo(false);
        table.boolean("can_manage_blocklists").defaultTo(false);
        table.boolean("can_manage_scheduled_tasks").defaultTo(false);
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
        table.string("created_by").notNullable().defaultTo("system");
        table.string("updated_by").notNullable().defaultTo("system");
    });

    return seed(knex);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("role_permissions");
}
