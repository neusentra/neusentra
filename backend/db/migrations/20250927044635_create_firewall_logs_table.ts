import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE TABLE neusentra.firewall_logs (
            id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
            device_id UUID NULL,
            src_ip INET NOT NULL,
            dst_ip INET NOT NULL,
            dest_port INT4 NOT NULL,
            action VARCHAR(20) NOT NULL,
            protocol VARCHAR(10) NOT NULL,
            timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NULL,
            CONSTRAINT firewall_logs_pkey PRIMARY KEY (id, timestamp),
            CONSTRAINT firewall_logs_device_id_foreign FOREIGN KEY (device_id) REFERENCES neusentra.devices(id) ON DELETE CASCADE
        ) PARTITION BY RANGE (timestamp);

        CREATE INDEX idx_firewall_logs_timestamp ON neusentra.firewall_logs(timestamp);
        CREATE INDEX idx_firewall_logs_src_ip ON neusentra.firewall_logs(src_ip);
        CREATE INDEX idx_firewall_logs_dst_ip ON neusentra.firewall_logs(dst_ip);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema('neusentra').dropTableIfExists("firewall_logs");
}