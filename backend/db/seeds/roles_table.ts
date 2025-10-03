import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("roles").insert([
        { name: "superadmin", description: "Has full access to all system features and settings." },
        { name: "admin", description: "Can manage users and settings." },
        { name: "user", description: "Very limited access." }
    ]);
};
