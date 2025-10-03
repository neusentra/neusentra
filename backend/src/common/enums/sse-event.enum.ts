export enum SseEventType {
    // System-level events
    PING = 'ping',

    // Auth/User Events
    SUPERADMIN_CREATED = 'superadmin.created',

    // Device/Policy Events (example)
    DEVICE_CONNECTED = 'device.connected',
    DEVICE_DISCONNECTED = 'device.disconnected',
    POLICY_UPDATED = 'policy.updated',

    // Custom
    NOTIFICATION = 'notification',
}
