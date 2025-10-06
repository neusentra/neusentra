import { z } from 'zod';

export const envSchema = z.object({
    VITE_SERVER_PORT: z.coerce
        .number()
        .int()
        .positive()
        .min(1000)
        .max(65535),

    VITE_APP_API_BASE_URL: z
        .string()
        .url()
        .refine(
            (url) => url.startsWith('http://') || url.startsWith('https://'),
            { message: 'API URL must start with http:// or https://' }
        ),

    VITE_APP_API_TIMEOUT: z.coerce
        .number()
        .int()
        .positive()
        .min(1000)
        .max(60000),
});

export type Env = z.infer<typeof envSchema>;