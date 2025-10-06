import { ZodError, type ZodSchema } from 'zod';
import { type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import pc from 'picocolors';

export interface ValidateEnvOptions {
    schema: ZodSchema;
    envFile?: string;
    allowEmptyValues?: boolean;
}

/**
 * Vite plugin that validates environment variables using Zod schemas
 * @param options - Configuration options for the plugin
 * @returns Vite plugin object
 */
export function validateEnvPlugin(options: ValidateEnvOptions): Plugin {
    const { schema, envFile = '.env', allowEmptyValues = false } = options;

    return {
        name: 'vite-plugin-validate-env',

        config() {
            const envFilePath = path.resolve(process.cwd(), envFile);

            if (!fs.existsSync(envFilePath)) {
                throw new Error(
                    `\n${pc.red('✖')} ${pc.bold('Environment file not found')}\n` +
                    `${pc.dim('Expected:')} ${pc.cyan(envFilePath)}\n`
                );
            }

            const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
            const envVars: Record<string, string> = {};

            envFileContent.split('\n').forEach(line => {
                const trimmedLine = line.trim();

                if (!trimmedLine || trimmedLine.startsWith('#')) return;

                const [key, ...valueParts] = trimmedLine.split('=');
                const value = valueParts.join('=').trim();

                if (key && (allowEmptyValues || value)) {
                    envVars[key.trim()] = value;
                }
            });

            const mergedEnv = { ...envVars, ...process.env };

            try {
                schema.parse(mergedEnv);
                console.log(`${pc.green('✓')} ${pc.dim('Environment variables validated')}`);
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors = error.issues
                        .map(err => `  ${pc.yellow('•')} ${pc.bold(err.path.join('.'))}: ${err.message}`)
                        .join('\n');

                    throw new Error(
                        `\n${pc.red('✖')} ${pc.bold('Environment validation failed')}\n\n${errors}\n`
                    );
                }
                throw error;
            }
        },
    };
}