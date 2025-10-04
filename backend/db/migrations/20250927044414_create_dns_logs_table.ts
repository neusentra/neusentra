import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE neusentra.dns_logs (
            id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
            device_id UUID NULL,
            domain VARCHAR(255) NOT NULL,
            action VARCHAR(20) NOT NULL,
            category VARCHAR(50) NULL,
            source VARCHAR(50) NULL,
            timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NULL,
            CONSTRAINT dns_logs_pkey PRIMARY KEY (id, timestamp),
            CONSTRAINT dns_logs_device_id_foreign FOREIGN KEY (device_id) REFERENCES neusentra.devices(id) ON DELETE CASCADE
        ) PARTITION BY RANGE (timestamp);

        CREATE INDEX idx_dns_logs_timestamp ON neusentra.dns_logs(timestamp);
        CREATE INDEX idx_dns_logs_domain ON neusentra.dns_logs(domain);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("dns_logs");
}
