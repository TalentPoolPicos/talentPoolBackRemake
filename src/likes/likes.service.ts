import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Verifica se o usuário logado deu like em outro usuário
   */
  async hasLiked(initiatorId: number, targetUuid: string): Promise<boolean> {
    this.logger.log(
      `Verificando se usuário ${initiatorId} deu like no usuário ${targetUuid}`,
    );

    // Buscar o usuário alvo pelo UUID
    const targetUser = await this.prisma.user.findUnique({
      where: { uuid: targetUuid },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se existe like
    const like = await this.prisma.like.findUnique({
      where: {
        initiatorId_receiverId: {
          initiatorId,
          receiverId: targetUser.id,
        },
      },
    });

    return !!like;
  }

  /**
   * Usuário logado dá like em outro usuário
   */
  async giveLike(initiatorId: number, targetUuid: string): Promise<void> {
    this.logger.log(
      `Usuário ${initiatorId} tentando dar like no usuário ${targetUuid}`,
    );

    // Buscar dados do usuário que está dando like
    const initiator = await this.prisma.user.findUnique({
      where: { id: initiatorId },
      select: { id: true, role: true, uuid: true },
    });

    if (!initiator) {
      throw new NotFoundException('Usuário iniciador não encontrado');
    }

    // Buscar dados do usuário alvo
    const targetUser = await this.prisma.user.findUnique({
      where: { uuid: targetUuid },
      select: { id: true, role: true, uuid: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário alvo não encontrado');
    }

    // Não permitir auto-like
    if (initiator.id === targetUser.id) {
      throw new BadRequestException('Não é possível dar like em si mesmo');
    }

    // Não permitir like entre usuários da mesma role
    if (initiator.role === targetUser.role) {
      throw new BadRequestException(
        'Não é possível dar like em usuários da mesma categoria',
      );
    }

    // Verificar se já existe like
    const existingLike = await this.prisma.like.findUnique({
      where: {
        initiatorId_receiverId: {
          initiatorId: initiator.id,
          receiverId: targetUser.id,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('Like já foi dado para este usuário');
    }

    // Criar o like
    await this.prisma.like.create({
      data: {
        initiatorId: initiator.id,
        receiverId: targetUser.id,
      },
    });

    this.logger.log(
      `Like criado com sucesso: ${initiator.uuid} -> ${targetUser.uuid}`,
    );
  }

  /**
   * Remove like do usuário logado para outro usuário
   */
  async removeLike(initiatorId: number, targetUuid: string): Promise<void> {
    this.logger.log(
      `Usuário ${initiatorId} tentando remover like do usuário ${targetUuid}`,
    );

    // Buscar o usuário alvo pelo UUID
    const targetUser = await this.prisma.user.findUnique({
      where: { uuid: targetUuid },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Buscar o like existente
    const like = await this.prisma.like.findUnique({
      where: {
        initiatorId_receiverId: {
          initiatorId,
          receiverId: targetUser.id,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like não encontrado');
    }

    // Remover o like
    await this.prisma.like.delete({
      where: { id: like.id },
    });

    this.logger.log(
      `Like removido com sucesso: ${initiatorId} -> ${targetUser.id}`,
    );
  }

  /**
   * Obtém usuários que deram like para o usuário especificado (initiators)
   */
  async getLikeInitiators(userUuid: string) {
    this.logger.log(`Buscando quem deu like no usuário ${userUuid}`);

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Buscar likes recebidos
    const likes = await this.prisma.like.findMany({
      where: { receiverId: user.id },
      include: {
        initiator: {
          select: {
            uuid: true,
            username: true,
            name: true,
            role: true,
            description: true,
            isVerified: true,
            isActive: true,
            avatar: {
              select: {
                storageKey: true,
              },
            },
            banner: {
              select: {
                storageKey: true,
              },
            },
            address: {
              select: {
                city: true,
                state: true,
              },
            },
            tags: {
              select: {
                label: true,
              },
              take: 5,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Gerar URLs dos avatares e banners
    const initiatorsWithAvatars = await Promise.all(
      likes.map(async (like) => {
        let avatarUrl: string | null = null;
        let bannerUrl: string | null = null;

        // Gerar URL do avatar
        if (like.initiator.avatar?.storageKey) {
          try {
            avatarUrl = await this.storageService.generateFileUrl(
              like.initiator.avatar.storageKey,
              3600,
            );
          } catch (error) {
            this.logger.warn(
              `Erro ao gerar URL do avatar para usuário ${like.initiator.uuid}:`,
              error,
            );
          }
        }

        // Gerar URL do banner
        if (like.initiator.banner?.storageKey) {
          try {
            bannerUrl = await this.storageService.generateFileUrl(
              like.initiator.banner.storageKey,
              3600,
            );
          } catch (error) {
            this.logger.warn(
              `Erro ao gerar URL do banner para usuário ${like.initiator.uuid}:`,
              error,
            );
          }
        }

        // Construir localização a partir do endereço
        let location: string | undefined;
        if (like.initiator.address?.city || like.initiator.address?.state) {
          const city = like.initiator.address.city || '';
          const state = like.initiator.address.state || '';
          location = `${city}${city && state ? ', ' : ''}${state}`.trim();
          if (location === '') location = undefined;
        }

        // Extrair nomes das tags
        const mainTags = like.initiator.tags?.map((tag) => tag.label) || [];

        // Truncar descrição para preview (máximo 200 caracteres)
        let description = like.initiator.description;
        if (description && description.length > 200) {
          description = description.substring(0, 197) + '...';
        }

        return {
          uuid: like.initiator.uuid,
          username: like.initiator.username,
          name: like.initiator.name,
          role: like.initiator.role,
          description: description || undefined,
          isVerified: like.initiator.isVerified,
          isActive: like.initiator.isActive,
          avatarUrl,
          bannerUrl,
          mainTags: mainTags.length > 0 ? mainTags : undefined,
          location: location || undefined,
          likedAt: like.createdAt,
        };
      }),
    );

    this.logger.log(
      `Encontrados ${initiatorsWithAvatars.length} likes recebidos`,
    );
    return initiatorsWithAvatars;
  }

  /**
   * Obtém usuários que receberam like do usuário especificado (receivers)
   */
  async getLikeReceivers(userUuid: string) {
    this.logger.log(`Buscando quem recebeu like do usuário ${userUuid}`);

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Buscar likes dados
    const likes = await this.prisma.like.findMany({
      where: { initiatorId: user.id },
      include: {
        receiver: {
          select: {
            uuid: true,
            username: true,
            name: true,
            role: true,
            description: true,
            isVerified: true,
            isActive: true,
            avatar: {
              select: {
                storageKey: true,
              },
            },
            banner: {
              select: {
                storageKey: true,
              },
            },
            address: {
              select: {
                city: true,
                state: true,
              },
            },
            tags: {
              select: {
                label: true,
              },
              take: 5,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Gerar URLs dos avatares e banners
    const receiversWithAvatars = await Promise.all(
      likes.map(async (like) => {
        let avatarUrl: string | null = null;
        let bannerUrl: string | null = null;

        // Gerar URL do avatar
        if (like.receiver.avatar?.storageKey) {
          try {
            avatarUrl = await this.storageService.generateFileUrl(
              like.receiver.avatar.storageKey,
              3600,
            );
          } catch (error) {
            this.logger.warn(
              `Erro ao gerar URL do avatar para usuário ${like.receiver.uuid}:`,
              error,
            );
          }
        }

        // Gerar URL do banner
        if (like.receiver.banner?.storageKey) {
          try {
            bannerUrl = await this.storageService.generateFileUrl(
              like.receiver.banner.storageKey,
              3600,
            );
          } catch (error) {
            this.logger.warn(
              `Erro ao gerar URL do banner para usuário ${like.receiver.uuid}:`,
              error,
            );
          }
        }

        // Construir localização a partir do endereço
        let location: string | undefined;
        if (like.receiver.address?.city || like.receiver.address?.state) {
          const city = like.receiver.address.city || '';
          const state = like.receiver.address.state || '';
          location = `${city}${city && state ? ', ' : ''}${state}`.trim();
          if (location === '') location = undefined;
        }

        // Extrair nomes das tags
        const mainTags = like.receiver.tags?.map((tag) => tag.label) || [];

        // Truncar descrição para preview (máximo 200 caracteres)
        let description = like.receiver.description;
        if (description && description.length > 200) {
          description = description.substring(0, 197) + '...';
        }

        return {
          uuid: like.receiver.uuid,
          username: like.receiver.username,
          name: like.receiver.name,
          role: like.receiver.role,
          description: description || undefined,
          isVerified: like.receiver.isVerified,
          isActive: like.receiver.isActive,
          avatarUrl,
          bannerUrl,
          mainTags: mainTags.length > 0 ? mainTags : undefined,
          location: location || undefined,
          likedAt: like.createdAt,
        };
      }),
    );

    this.logger.log(`Encontrados ${receiversWithAvatars.length} likes dados`);
    return receiversWithAvatars;
  }
}
