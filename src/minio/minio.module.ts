import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MINIO_TOKEN } from './minio.decorator';
import * as Minio from 'minio';
import { FilesService } from './file.service';
import { MinioController } from './minio.controller';

@Global()
@Module({
  exports: [MINIO_TOKEN, FilesService],
  providers: [
    {
      inject: [ConfigService],
      provide: MINIO_TOKEN,
      useFactory: (configService: ConfigService): Minio.Client => {
        const client = new Minio.Client({
          endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
          port: +configService.getOrThrow('MINIO_API_PORT_NUMBER'),
          accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
          useSSL: false,
        });
        return client;
      },
    },
    FilesService,
  ],
  controllers: [MinioController],
})
export class MinioModule {}
