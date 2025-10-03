import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import validationSchema from './config/validation';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { EventsModule } from './events/events.module';
import { CommonModule } from './common/common.module';
import { JwtTokenModule } from './jwt-token/jwt-token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    ApiModule,
    EventsModule,
    JwtTokenModule,
    CommonModule
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
