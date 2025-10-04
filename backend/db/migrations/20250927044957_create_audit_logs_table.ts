import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE neusentra.audit_logs (
            id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
            user_id uuid NULL,
            action varchar(100) NOT NULL,
            entity_type varchar(50) NULL,
            entity_id uuid NULL,
            details jsonb NULL,
            timestamp timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
            CONSTRAINT audit_logs_pkey PRIMARY KEY (id, timestamp),
            CONSTRAINT audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES neusentra.users(id)
        ) PARTITION BY RANGE (timestamp);

        CREATE INDEX idx_audit_logs_timestamp ON neusentra.audit_logs(timestamp);
        CREATE INDEX idx_audit_logs_user_id ON neusentra.audit_logs(user_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("audit_logs");
};