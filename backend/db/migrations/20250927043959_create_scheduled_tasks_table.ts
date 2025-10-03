import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable("scheduled_tasks", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("task_name", 100).notNullable();
        table.string("cron_expression", 50).notNullable();
        table.timestamp("last_run", { useTz: true }).nullable();
        table.timestamp("next_run", { useTz: true }).nullable();
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("scheduled_tasks");
}

