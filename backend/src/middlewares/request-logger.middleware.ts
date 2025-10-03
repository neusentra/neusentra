import morgan from 'morgan';
import { CustomLogger } from 'src/logger/custom-logger.service';

export function useRequestLogging(app) {
  const logger = new CustomLogger('Http');
  const env = process.env.NODE_ENV;
  const logFormat = `:remote-addr - :remote-user ":method "url HTTP/:http-version" status :res[content-length] ":referrer" ":user-agent" :response-time ms" `;

  app.use(
    morgan(logFormat, {
      skip: (req) => env === 'production',
      stream: { write: (message) => logger.log(message.replace('\n', '')) },
    }),
  );
}
