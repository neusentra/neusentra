import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as K from './common/constants';
import { AppModule } from './app.module';
import { CustomLogger } from './logger/custom-logger.service';
import { useRequestLogging } from './middlewares/request-logger.middleware';
import { SuccessResponseInterceptor } from './interceptors/success-response.interceptor';
import { name, description, version } from 'package.json';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';

const logger = new CustomLogger('Main');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: K.MAX_JSON_REQUEST_SIZE }),
    { rawBody: true },
  );
  useRequestLogging(app);
  app.useLogger(logger);
  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  const config = app.get<ConfigService>(ConfigService);
  const env = config.get<string>('config.server.env');
  const port = config.get<number>('config.server.port') ?? 3333;
  const swaggerEnabled = config.get<string>('config.swagger.enabled');
  const cookieSecret = config.get<string>('config.cookie.secret');

  await app.register(fastifyCookie as any, {
    secret: cookieSecret,
  });

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, X-Session-Id',
  });

  app.enableVersioning({ type: VersioningType.URI });

  // Swagger configuration
  if (swaggerEnabled === 'true' && env === 'local') {
    const options = new DocumentBuilder()
      .setTitle(name)
      .setDescription(`${description}\nRunning on ${env} Mode`)
      .setVersion(version)
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`Listening on port ${port}, running in ${env} environment`);
}

try {
  void bootstrap();
} catch (error) {
  logger.error('Bootstrap failed:', error);
  process.exit(1);
}
