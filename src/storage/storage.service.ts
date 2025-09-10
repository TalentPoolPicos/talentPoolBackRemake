import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { AttachmentType } from '@prisma/client';
import * as path from 'path';
import * as crypto from 'crypto';
import { UploadResult } from './dtos/upload.dto';

/**
 * Interface para configuração do MinIO
 */
interface MinioConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

/**
 * Service para gerenciamento de storage com MinIO
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly config: MinioConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      endpoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10),
      useSSL:
        this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>(
        'MINIO_ROOT_USER',
        'minioadmin',
      ),
      secretKey: this.configService.get<string>(
        'MINIO_ROOT_PASSWORD',
        'minioadmin123',
      ),
      bucketName: this.configService.get<string>(
        'MINIO_BUCKET_NAME',
        'talentpool-uploads',
      ),
    };

    this.bucketName = this.config.bucketName;

    // Inicializar cliente MinIO
    this.minioClient = new Minio.Client({
      endPoint: this.config.endpoint,
      port: this.config.port,
      useSSL: this.config.useSSL,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
    });

    this.logger.log(
      `MinIO configurado: ${this.config.endpoint}:${this.config.port}`,
    );
    // Inicializar bucket de forma assíncrona sem bloquear o constructor
    void this.initializeBucket();
  }

  /**
   * Helper para tratar erros de forma type-safe
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Helper para obter stack trace de forma type-safe
   */
  private getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack;
    }
    return undefined;
  }

  /**
   * Inicializa o bucket se não existir
   */
  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' criado com sucesso`);
      } else {
        this.logger.log(`Bucket '${this.bucketName}' já existe`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao inicializar bucket: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw new InternalServerErrorException('Erro na configuração do storage');
    }
  }

  /**
   * Faz upload de um arquivo
   */
  async uploadFile(
    file: Express.Multer.File,
    attachmentType: AttachmentType,
    userId?: number,
  ): Promise<UploadResult> {
    try {
      // Validar arquivo
      this.validateFile(file, attachmentType);

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const timestamp = Date.now();
      const randomSuffix = crypto.randomBytes(8).toString('hex');
      const filename = `${attachmentType}_${timestamp}_${randomSuffix}${fileExtension}`;

      // Gerar chave de storage com prefixo por tipo
      const storageKey = this.generateStorageKey(
        attachmentType,
        filename,
        userId,
      );

      // Metadata do arquivo
      const metadata = {
        'Content-Type': file.mimetype,
        'Original-Name': file.originalname,
        'Upload-Date': new Date().toISOString(),
        'Attachment-Type': attachmentType,
        ...(userId && { 'User-Id': userId.toString() }),
      };

      // Upload para MinIO
      await this.minioClient.putObject(
        this.bucketName,
        storageKey,
        file.buffer,
        file.size,
        metadata,
      );

      this.logger.log(`Arquivo uploadado: ${storageKey} (${file.size} bytes)`);

      // Gerar URL de acesso (opcional)
      const url = await this.generateFileUrl(storageKey);

      return {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: attachmentType,
        storageKey,
        url,
      };
    } catch (error) {
      this.logger.error(
        `Erro no upload: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro interno no upload do arquivo',
      );
    }
  }

  /**
   * Gera URL de acesso temporária para um arquivo
   */
  async generateFileUrl(
    storageKey: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        storageKey,
        expirySeconds,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao gerar URL: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw new InternalServerErrorException('Erro ao gerar URL do arquivo');
    }
  }

  /**
   * Remove um arquivo do storage
   */
  async deleteFile(storageKey: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, storageKey);
      this.logger.log(`Arquivo removido: ${storageKey}`);
    } catch (error) {
      this.logger.error(
        `Erro ao remover arquivo: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw new InternalServerErrorException('Erro ao remover arquivo');
    }
  }

  /**
   * Obtém informações de um arquivo
   */
  async getFileInfo(storageKey: string): Promise<Minio.BucketItemStat> {
    try {
      return await this.minioClient.statObject(this.bucketName, storageKey);
    } catch (error) {
      this.logger.error(
        `Erro ao obter info do arquivo: ${this.getErrorMessage(error)}`,
        this.getErrorStack(error),
      );
      throw new InternalServerErrorException(
        'Erro ao obter informações do arquivo',
      );
    }
  }

  /**
   * Valida o arquivo baseado no tipo de attachment
   */
  private validateFile(
    file: Express.Multer.File,
    attachmentType: AttachmentType,
  ): void {
    // Tamanho máximo por tipo (em bytes)
    const maxSizes = {
      profile_picture: 5 * 1024 * 1024, // 5MB
      banner_picture: 10 * 1024 * 1024, // 10MB
      curriculum: 20 * 1024 * 1024, // 20MB
      document: 50 * 1024 * 1024, // 50MB
      image: 10 * 1024 * 1024, // 10MB
      video: 500 * 1024 * 1024, // 500MB
      audio: 100 * 1024 * 1024, // 100MB
      history: 20 * 1024 * 1024, // 20MB
      other: 20 * 1024 * 1024, // 20MB
    };

    // Tipos MIME permitidos por tipo
    const allowedMimeTypes: Record<AttachmentType, string[]> = {
      profile_picture: ['image/jpeg', 'image/png', 'image/webp'],
      banner_picture: ['image/jpeg', 'image/png', 'image/webp'],
      curriculum: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      history: ['application/pdf', 'text/plain'],
      other: [], // Permite qualquer tipo
    };

    // Validar tamanho
    const maxSize = maxSizes[attachmentType];
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo para ${attachmentType}: ${this.formatBytes(maxSize)}`,
      );
    }

    // Validar tipo MIME
    const allowed = allowedMimeTypes[attachmentType];
    if (allowed.length > 0 && !allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido para ${attachmentType}. Tipos aceitos: ${allowed.join(', ')}`,
      );
    }

    // Validar se o arquivo não está vazio
    if (file.size === 0) {
      throw new BadRequestException('Arquivo não pode estar vazio');
    }
  }

  /**
   * Gera chave única de storage
   */
  private generateStorageKey(
    attachmentType: AttachmentType,
    filename: string,
    userId?: number,
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    let prefix = `${attachmentType}/${year}/${month}`;

    if (userId) {
      prefix += `/user_${userId}`;
    }

    return `${prefix}/${filename}`;
  }

  /**
   * Formata bytes em string legível
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtém configuração atual do MinIO (para debug)
   */
  getConfig(): Partial<MinioConfig> {
    return {
      endpoint: this.config.endpoint,
      port: this.config.port,
      useSSL: this.config.useSSL,
      bucketName: this.config.bucketName,
    };
  }
}
