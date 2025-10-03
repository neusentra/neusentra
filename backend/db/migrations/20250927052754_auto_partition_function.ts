import { knex, type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
    DO $$
    DECLARE
        start_date DATE := date_trunc('month', now());
        i INTEGER := 0;
        schemas TEXT[] := ARRAY['neusentra'];
        tables TEXT[] := ARRAY['dns_logs', 'firewall_logs', 'audit_logs'];
    BEGIN
        FOR i IN 0..2 LOOP
            FOR j IN array_lower(tables, 1)..array_upper(tables, 1) LOOP
                EXECUTE format(
                    'CREATE TABLE IF NOT EXISTS %I.%I_%s PARTITION OF %I.%I FOR VALUES FROM (%L) TO (%L);',
                    schemas[1], tables[j], to_char(start_date + (i || ' month')::interval, 'YYYY_MM'),
                    schemas[1], tables[j],
                    (start_date + (i || ' month')::interval)::text,
                    (start_date + ((i+1) || ' month')::interval)::text
                );
            END LOOP;
        END LOOP;
    END$$;
    `);
}

export async function down(knex: Knex): Promise<void> {
    const schema = 'neusentra';
    const tableNames = ['dns_logs', 'firewall_logs', 'audit_logs'];
    const now = new Date();

    const dropStatements: string[] = [];

    for (let i = 0; i <= 2; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const suffix = `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}`;

        for (const baseTable of tableNames) {
            const partitionName = `${baseTable}_${suffix}`;
            dropStatements.push(`DROP TABLE IF EXISTS "${schema}"."${partitionName}" CASCADE`);
        }
    }

    // Execute all DROP TABLE commands in parallel
    await Promise.all(dropStatements.map(sql => knex.raw(sql)));
}