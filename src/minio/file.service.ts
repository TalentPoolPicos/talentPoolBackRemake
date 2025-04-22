import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as Minio from 'minio';
import { InjectMinio } from 'src/minio/minio.decorator';

@Injectable()
export class FilesService {
  protected _bucketName = 'main';

  constructor(@InjectMinio() private readonly minioService: Minio.Client) {}

  async bucketsList() {
    return await this.minioService.listBuckets();
  }

  async getUrl(filename: string): Promise<string | null> {
    try {
      return this.minioService.presignedUrl('GET', this._bucketName, filename);
    } catch {
      return null;
    }
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
