import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable("devices", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("name", 100).notNullable();
        table.string("mac_address", 17).notNullable().unique();
        table.specificType("ip_address", "INET");
        table.string("hostname", 100).nullable();
        table.string("device_type", 50).nullable();
        table.uuid("device_group_id").nullable().references("id").inTable("neusentra.device_groups").onDelete("SET NULL");
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
        table.string("created_by").notNullable();
        table.string("updated_by").notNullable();
    });
    await knex.schema.raw(`CREATE INDEX idx_devices_mac ON neusentra.devices (mac_address)`);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("devices");
}

