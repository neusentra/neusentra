const env = import.meta.env;

export default {
    server: {
        port: env.VITE_APP_PORT,
    },
    api: {
        baseUrl: env.VITE_APP_API_BASE_URL,
        timeout: parseInt(env.VITE_APP_API_TIMEOUT, 10),
    }
}