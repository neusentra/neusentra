import { Module } from '@nestjs/common';
import { HttpClientService } from './http-client.service';
import { CustomLoggerModule } from 'src/logger/custom-logger.module';
import { HttpModule } from '@nestjs/axios';
import { CONTENT_TYPE } from 'src/common/constants';

@Module({
  imports: [
    CustomLoggerModule,
    HttpModule.registerAsync({
      inject: ['REQUEST'],
      useFactory: async (req: Request) => ({
        transformRequest: [
          (data, headers) => {
            // Check whether header has form-urlencoded Content Type
            const header = headers['Content-Type'];
            const isHeaderUrlEncoded = header === CONTENT_TYPE.FORM_URL_ENCODED;

            // Add Content Type only when request body is present
            if (data) {
              headers['Content-Type'] = `${
                isHeaderUrlEncoded
                  ? CONTENT_TYPE.FORM_URL_ENCODED
                  : CONTENT_TYPE.JSON
              } ; charset=utf-8`;
              headers['Accept'] = CONTENT_TYPE.JSON;
            }
          },
        ],
      }),
    }),
  ],
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}
