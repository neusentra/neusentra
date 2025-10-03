import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').createTable('user_login', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable();
        table.timestamp('login_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('logout_at').notNullable().defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists('user_login');
}

