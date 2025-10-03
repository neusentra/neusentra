import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    const userRole = await knex("roles").where({ name: "user" }).first("id");

    await knex.schema.withSchema('neusentra').createTable("users", (table: any) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("fullname", 25).notNullable();
        table.string("username", 20).notNullable().unique();
        table.text("password_hash").notNullable();
        table.uuid("role_id")
            .notNullable()
            .references("id")
            .inTable("roles")
            .onDelete("CASCADE")
            .defaultTo(userRole?.id);
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
        table.string("created_by").notNullable().defaultTo("system");
        table.string("updated_by").notNullable().defaultTo("system");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("users");
}

