import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex("neusentra.device_groups").insert([
        { name: "iot_devices", description: "Smart home and IoT devices" },
        { name: "family_devices", description: "Personal devices of family members" },
        { name: "guest_devices", description: "Guest devices with limited access" },
    ]);
};
