import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable("policies", (table: any) => { 
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("name", 50).notNullable().unique();
        table.uuid("group_id").notNullable().references("id").inTable("neusentra.device_groups").onDelete("CASCADE");
        table.jsonb("config").notNullable();
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
        table.string("created_by").notNullable();
        table.string("updated_by").notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("policies");
}

