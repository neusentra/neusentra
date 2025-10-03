import type { Knex } from "knex";
import { seed } from '../seeds/device_groups_table';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable("device_groups", (table:any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("name", 50).notNullable().unique();
        table.text("description").nullable();
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
        table.string("created_by").notNullable().defaultTo("system");
        table.string("updated_by").notNullable().defaultTo("system");
    });

    return seed(knex);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("device_groups");
}

