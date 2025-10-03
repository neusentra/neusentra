import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable("network_settings", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("settings_name", 50).notNullable().unique();
        table.jsonb("config").notNullable();
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
        table.string("created_by").notNullable().defaultTo("system");
        table.string("updated_by").notNullable().defaultTo("system");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("network_settings");
}

