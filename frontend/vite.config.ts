import { DEFAULT_APP_PORT } from './src/constants';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { validateEnvPlugin } from './plugins'
import { envSchema } from './envSchema'
import path from 'path';


export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    plugins: [
      validateEnvPlugin({
        schema: envSchema,
        envFile: '.env',
      }),
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: +env.VITE_PORT || DEFAULT_APP_PORT,
    },
  });
}