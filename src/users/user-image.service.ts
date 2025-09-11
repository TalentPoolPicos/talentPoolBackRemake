import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { AttachmentType } from '@prisma/client';
import * as sharp from 'sharp';

interface ImageValidationRules {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio?: {
    min: number;
    max: number;
  };
  maxSizeBytes: number;
  allowedFormats: string[];
}

@Injectable()
export class UserImageService {
  private readonly logger = new Logger(UserImageService.name);

  // Regras de validação para diferentes tipos de imagem
  private readonly imageRules: Record<AttachmentType, ImageValidationRules> = {
    profile_picture: {
      maxWidth: 1000,
      maxHeight: 1000,
      minWidth: 150,
      minHeight: 150,
      aspectRatio: { min: 0.8, max: 1.25 }, // Aproximadamente quadrado
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpeg', 'jpg', 'png', 'webp'],
    },
    banner_picture: {
      maxWidth: 1920,
      maxHeight: 1080,
      minWidth: 800,
      minHeight: 300,
      aspectRatio: { min: 2.0, max: 4.0 }, // Formato retangular horizontal
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['jpeg', 'jpg', 'png', 'webp'],
    },
    // Outras regras para outros tipos (não usadas neste contexto)
    curriculum: {
      maxWidth: 0,
      maxHeight: 0,
      minWidth: 0,
      minHeight: 0,
      maxSizeBytes: 0,
      allowedFormats: [],
    },
    history: {
      maxWidth: 0,
      maxHeight: 0,
      minWidth: 0,
      minHeight: 0,
      maxSizeBytes: 0,
      allowedFormats: [],
    },
    document: {
      maxWidth: 0,
      maxHeight: 0,
      minWidth: 0,
      minHeight: 0,
      maxSizeBytes: 0,
      allowedFormats: [],
    },
    image: {
      maxWidth: 0,
      maxHeight: 0,
      minWidth: 0,
      minHeight: 0,
      maxSizeBytes: 0,
      allowedFormats: [],
    },
    video: {
      maxWidth: 0,
      maxHeight: 0,
      minWidth: 0,
      minHeight: 0,
      maxSizeBytes: 0,
      allowedFormats: [],
    },
    audio: {
      maxWidth: 0,
      maxHeight: 0,
      minWidth: 0,
      minHeight: 0,
      maxSizeBytes: 0,
      allowedFormats: [],
    },
    other: {
      maxWidth: 0,
      maxHeight: 0,
      minWidth: 0,
      minHeight: 0,
      maxSizeBytes: 0,
      allowedFormats: [],
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Valida arquivo de imagem
   */
  private async validateImageFile(
    file: Express.Multer.File,
    type: AttachmentType,
  ): Promise<void> {
    const rules = this.imageRules[type];

    // Validar tamanho do arquivo
    if (file.size > rules.maxSizeBytes) {
      throw new BadRequestException(
        `Arquivo muito grande. Máximo permitido: ${Math.round(rules.maxSizeBytes / (1024 * 1024))}MB`,
      );
    }

    // Validar extensão
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !rules.allowedFormats.includes(fileExtension)) {
      throw new BadRequestException(
        `Formato não permitido. Formatos aceitos: ${rules.allowedFormats.join(', ')}`,
      );
    }

    // Validar tipo MIME
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Apenas imagens são aceitas.',
      );
    }

    // Validar dimensões usando Sharp
    try {
      const metadata = await sharp(file.buffer).metadata();
      const { width = 0, height = 0 } = metadata;

      if (
        width < rules.minWidth ||
        height < rules.minHeight ||
        width > rules.maxWidth ||
        height > rules.maxHeight
      ) {
        throw new BadRequestException(
          `Dimensões inválidas. Requerido: ${rules.minWidth}x${rules.minHeight} a ${rules.maxWidth}x${rules.maxHeight}px`,
        );
      }

      // Validar proporção se especificada
      if (rules.aspectRatio) {
        const aspectRatio = width / height;
        if (
          aspectRatio < rules.aspectRatio.min ||
          aspectRatio > rules.aspectRatio.max
        ) {
          throw new BadRequestException(
            `Proporção inválida. ${type === 'profile_picture' ? 'Avatar deve ser aproximadamente quadrado' : 'Banner deve ter formato retangular horizontal'}`,
          );
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Não foi possível processar a imagem. Verifique se o arquivo é uma imagem válida.',
      );
    }
  }

  /**
   * Upload de avatar do usuário
   */
  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string; filename: string }> {
    this.logger.log(`Iniciando upload de avatar para usuário ID: ${userId}`);

    // Validar imagem
    await this.validateImageFile(file, 'profile_picture');

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Remover avatar antigo se existir
    if (user.avatar) {
      this.logger.log(`Removendo avatar antigo: ${user.avatar.storageKey}`);
      try {
        await this.storageService.deleteFile(user.avatar.storageKey);
        await this.prisma.attachment.delete({
          where: { id: user.avatar.id },
        });
      } catch (error) {
        this.logger.warn(
          `Erro ao remover avatar antigo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        );
      }
    }

    // Fazer upload do novo avatar
    const uploadResult = await this.storageService.uploadFile(
      file,
      'profile_picture',
      userId,
    );

    // Salvar attachment no banco
    await this.prisma.attachment.create({
      data: {
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        type: uploadResult.type,
        storageKey: uploadResult.storageKey,
        avatarUserId: userId,
      },
    });

    // Gerar URL temporária
    const avatarUrl = await this.storageService.generateFileUrl(
      uploadResult.storageKey,
      3600, // 1 hora
    );

    this.logger.log(
      `Upload de avatar concluído com sucesso para usuário ID: ${userId}`,
    );

    return {
      avatarUrl,
      filename: uploadResult.filename,
    };
  }

  /**
   * Upload de banner do usuário
   */
  async uploadBanner(
    userId: number,
    file: Express.Multer.File,
  ): Promise<{ bannerUrl: string; filename: string }> {
    this.logger.log(`Iniciando upload de banner para usuário ID: ${userId}`);

    // Validar imagem
    await this.validateImageFile(file, 'banner_picture');

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { banner: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Remover banner antigo se existir
    if (user.banner) {
      this.logger.log(`Removendo banner antigo: ${user.banner.storageKey}`);
      try {
        await this.storageService.deleteFile(user.banner.storageKey);
        await this.prisma.attachment.delete({
          where: { id: user.banner.id },
        });
      } catch (error) {
        this.logger.warn(
          `Erro ao remover banner antigo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        );
      }
    }

    // Fazer upload do novo banner
    const uploadResult = await this.storageService.uploadFile(
      file,
      'banner_picture',
      userId,
    );

    // Salvar attachment no banco
    await this.prisma.attachment.create({
      data: {
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        type: uploadResult.type,
        storageKey: uploadResult.storageKey,
        bannerUserId: userId,
      },
    });

    // Gerar URL temporária
    const bannerUrl = await this.storageService.generateFileUrl(
      uploadResult.storageKey,
      3600, // 1 hora
    );

    this.logger.log(
      `Upload de banner concluído com sucesso para usuário ID: ${userId}`,
    );

    return {
      bannerUrl,
      filename: uploadResult.filename,
    };
  }

  /**
   * Gera URL para avatar do usuário
   */
  async getAvatarUrl(userId: number): Promise<string | null> {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        avatarUserId: userId,
        type: 'profile_picture',
      },
    });

    if (!attachment) {
      return null;
    }

    return this.storageService.generateFileUrl(attachment.storageKey, 3600);
  }

  /**
   * Gera URL para banner do usuário
   */
  async getBannerUrl(userId: number): Promise<string | null> {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        bannerUserId: userId,
        type: 'banner_picture',
      },
    });

    if (!attachment) {
      return null;
    }

    return this.storageService.generateFileUrl(attachment.storageKey, 3600);
  }
}
