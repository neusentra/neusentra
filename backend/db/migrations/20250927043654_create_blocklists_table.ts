import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable("blocklists", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("type", 20).notNullable();
        table.string("value").notNullable();
        table.string("source", 50);
        table.string("category", 50);
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.unique(["type", "value"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("blocklists");
}

