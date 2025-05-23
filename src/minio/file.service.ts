import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as Minio from 'minio';
import { InjectMinio } from 'src/minio/minio.decorator';

@Injectable()
export class FilesService {
  protected _bucketName = 'main';

  constructor(
    @InjectMinio() private readonly minioService: Minio.Client,
    private readonly configService: ConfigService,
  ) {}

  async bucketsList() {
    return await this.minioService.listBuckets();
  }

  getUrl(filename: string): string {
    return `${this.configService.get('MINIO_SERVER_URL')}/api/v1/minio/${filename}`;
  }

  async getMinIOUrl(filename: string): Promise<string | null> {
    try {
      return this.minioService.presignedUrl('GET', this._bucketName, filename);
    } catch {
      return null;
    }
  }

  async getFile(uuid: string): Promise<{
    stream: NodeJS.ReadableStream;
    meta: Minio.BucketItemStat;
  }> {
    const bucket = 'main';
    const stream = await this.minioService.getObject(bucket, uuid);
    const meta = await this.minioService.statObject(bucket, uuid);
    return { stream, meta };
  }

  async upload(file: Express.Multer.File) {
    const extension = file.originalname.split('.').pop();
    const filename = `${randomUUID().toString()}.${extension}`;
    const result = await this.minioService.putObject(
      this._bucketName,
      filename,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    return { result, filename };
  }

  async delete(filename: string) {
    return await this.minioService.removeObject(this._bucketName, filename);
  }
}
