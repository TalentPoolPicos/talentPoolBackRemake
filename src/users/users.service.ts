import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SearchService } from '../search/search.service';
import { UserImageService } from './user-image.service';
import {
  UserWithFullProfile,
  UserStats,
} from './interfaces/user-profile.interface';
import {
  UpdateProfileDto,
  UpdateStudentProfileDto,
  UpdateEnterpriseProfileDto,
  UpdateSocialMediaDto,
  UpdateTagsDto,
  AddTagDto,
  UpdateAddressDto,
  CreateAddressDto,
  UpdateAddressDirectDto,
} from './dtos/update-profile.dto';
import {
  UserProfileResponseDto,
  PublicUserProfileResponseDto,
  UserPreviewResponseDto,
} from './dtos/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private userImageService: UserImageService,
    private searchService: SearchService,
  ) {}

  /**
   * Obtém URLs das imagens e documentos do usuário (avatar, banner, curriculum, history)
   */
  private async getUserImageUrls(userId: number): Promise<{
    avatarUrl?: string;
    bannerUrl?: string;
    curriculumUrl?: string;
    historyUrl?: string;
  }> {
    try {
      const [avatarUrl, bannerUrl, curriculumUrl, historyUrl] =
        await Promise.all([
          this.userImageService.getAvatarUrl(userId),
          this.userImageService.getBannerUrl(userId),
          this.userImageService.getCurriculumUrl(userId),
          this.userImageService.getHistoryUrl(userId),
        ]);

      return {
        avatarUrl: avatarUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        curriculumUrl: curriculumUrl || undefined,
        historyUrl: historyUrl || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao obter URLs das imagens do usuário ${userId}:`,
        error,
      );
      return {};
    }
  }

  /**
   * Busca perfil completo do usuário (privado - para /me)
   */
  async getMyProfile(userId: number): Promise<UserProfileResponseDto> {
    this.logger.log(`Buscando perfil privado do usuário ID: ${userId}`);

    const user = await this.findUserWithFullProfile(userId);
    if (!user) {
      this.logger.warn(
        `Perfil privado não encontrado para usuário ID: ${userId}`,
      );
      throw new NotFoundException('Usuário não encontrado');
    }

    const stats = await this.getUserStats(userId);
    const imageUrls = await this.getUserImageUrls(userId);

    this.logger.log(
      `Perfil privado carregado com sucesso para usuário: ${user.username}`,
    );
    return this.mapToPrivateProfileDto(user, stats, imageUrls);
  }

  /**
   * Busca perfil público do usuário
   */
  async getPublicProfile(uuid: string): Promise<PublicUserProfileResponseDto> {
    this.logger.log(`Buscando perfil público do usuário UUID: ${uuid}`);

    const user = await this.findUserByUuidWithProfile(uuid);
    if (!user) {
      this.logger.warn(`Perfil público não encontrado para UUID: ${uuid}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.isActive || user.isDeleted) {
      this.logger.warn(
        `Tentativa de acesso a perfil inativo/deletado UUID: ${uuid}`,
      );
      throw new NotFoundException('Perfil não disponível');
    }

    const imageUrls = await this.getUserImageUrls(user.id);

    this.logger.log(
      `Perfil público carregado com sucesso para usuário: ${user.username}`,
    );
    return this.mapToPublicProfileDto(user, imageUrls);
  }

  /**
   * Busca preview resumido do usuário
   */
  async getUserPreview(uuid: string): Promise<UserPreviewResponseDto> {
    this.logger.log(`Buscando preview do usuário com UUID: ${uuid}`);

    const user = await this.findUserByUuidWithProfile(uuid);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const imageUrls = await this.getUserImageUrls(user.id);

    this.logger.log(
      `Preview carregado com sucesso para usuário: ${user.username}`,
    );

    return this.mapToPreviewDto(
      user,
      imageUrls.avatarUrl || undefined,
      imageUrls.bannerUrl || undefined,
    );
  }

  /**
   * Atualiza perfil básico do usuário
   */
  async updateProfile(
    userId: number,
    updateData: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    this.logger.log(`Atualizando perfil básico do usuário ID: ${userId}`);

    const user = await this.findUserById(userId);
    if (!user) {
      this.logger.warn(`Usuário não encontrado para atualização ID: ${userId}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatePayload: Record<string, unknown> = {};

    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name;
    }

    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description;
    }

    if (updateData.birthDate !== undefined) {
      updatePayload.birthDate = new Date(updateData.birthDate);
    }

    if (Object.keys(updatePayload).length === 0) {
      this.logger.log(
        `Nenhum dado para atualizar no perfil básico do usuário ID: ${userId}`,
      );
      // Se não há dados para atualizar, retorna o perfil atual
      return this.getMyProfile(userId);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    // Sincronizar com Meilisearch
    try {
      await this.searchService.syncUserAfterChange(userId);
    } catch (error) {
      this.logger.warn(`Failed to sync user ${userId} to search index`, error);
    }

    this.logger.log(
      `Perfil básico atualizado com sucesso para usuário ID: ${userId}`,
    );
    return this.getMyProfile(userId);
  }

  /**
   * Atualiza perfil de estudante
   */
  async updateStudentProfile(
    userId: number,
    updateData: UpdateStudentProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserWithProfile(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role !== 'student') {
      throw new ForbiddenException(
        'Apenas estudantes podem atualizar perfil de estudante',
      );
    }

    if (!user.student) {
      throw new NotFoundException('Perfil de estudante não encontrado');
    }

    const updatePayload: Record<string, unknown> = {};

    if (updateData.course !== undefined) {
      updatePayload.course = updateData.course;
    }

    if (updateData.registrationNumber !== undefined) {
      // Verificar se o número de matrícula já existe
      if (updateData.registrationNumber) {
        const existingStudent = await this.prisma.student.findUnique({
          where: { registrationNumber: updateData.registrationNumber },
        });

        if (existingStudent && existingStudent.id !== user.student.id) {
          throw new ConflictException('Número de matrícula já está em uso');
        }
      }
      updatePayload.registrationNumber = updateData.registrationNumber;
    }

    if (updateData.lattes !== undefined) {
      updatePayload.lattes = updateData.lattes;
    }

    if (Object.keys(updatePayload).length > 0) {
      await this.prisma.student.update({
        where: { id: user.student.id },
        data: updatePayload,
      });

      // Sincronizar com Meilisearch
      try {
        await this.searchService.syncUserAfterChange(userId);
      } catch (error) {
        this.logger.warn(
          `Failed to sync user ${userId} to search index:`,
          error,
        );
      }
    }

    return this.getMyProfile(userId);
  }

  /**
   * Atualiza perfil de empresa
   */
  async updateEnterpriseProfile(
    userId: number,
    updateData: UpdateEnterpriseProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserWithProfile(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role !== 'enterprise') {
      throw new ForbiddenException(
        'Apenas empresas podem atualizar perfil de empresa',
      );
    }

    if (!user.enterprise) {
      throw new NotFoundException('Perfil de empresa não encontrado');
    }

    const updatePayload: Record<string, unknown> = {};

    if (updateData.fantasyName !== undefined) {
      updatePayload.fantasyName = updateData.fantasyName;
    }

    if (updateData.cnpj !== undefined) {
      // Verificar se o CNPJ já existe
      if (updateData.cnpj) {
        const existingEnterprise = await this.prisma.enterprise.findUnique({
          where: { cnpj: updateData.cnpj },
        });

        if (
          existingEnterprise &&
          existingEnterprise.id !== user.enterprise.id
        ) {
          throw new ConflictException('CNPJ já está em uso');
        }
      }
      updatePayload.cnpj = updateData.cnpj;
    }

    if (updateData.socialReason !== undefined) {
      updatePayload.socialReason = updateData.socialReason;
    }

    if (Object.keys(updatePayload).length > 0) {
      await this.prisma.enterprise.update({
        where: { id: user.enterprise.id },
        data: updatePayload,
      });

      // Sincronizar com Meilisearch
      try {
        await this.searchService.syncUserAfterChange(userId);
      } catch (error) {
        this.logger.warn(
          `Failed to sync user ${userId} to search index:`,
          error,
        );
      }
    }

    return this.getMyProfile(userId);
  }

  /**
   * Atualiza redes sociais do usuário
   */
  async updateSocialMedia(
    userId: number,
    updateData: UpdateSocialMediaDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateData.socialMedia) {
      // Remove todas as redes sociais existentes
      await this.prisma.socialMedia.deleteMany({
        where: { userId },
      });

      // Adiciona as novas redes sociais
      if (updateData.socialMedia.length > 0) {
        await this.prisma.socialMedia.createMany({
          data: updateData.socialMedia.map((sm) => ({
            userId,
            type: sm.type,
            url: sm.url,
          })),
        });
      }
    }

    return this.getMyProfile(userId);
  }

  /**
   * Deleta uma rede social específica do usuário
   */
  async deleteSocialMedia(
    userId: number,
    socialMediaUuid: string,
  ): Promise<UserProfileResponseDto> {
    this.logger.log(
      `Deletando rede social ${socialMediaUuid} do usuário ID: ${userId}`,
    );

    const user = await this.findUserById(userId);
    if (!user) {
      this.logger.warn(`Usuário não encontrado para ID: ${userId}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se a rede social existe e pertence ao usuário
    const socialMedia = await this.prisma.socialMedia.findFirst({
      where: {
        uuid: socialMediaUuid,
        userId,
      },
    });

    if (!socialMedia) {
      this.logger.warn(
        `Rede social ${socialMediaUuid} não encontrada para usuário ${userId}`,
      );
      throw new NotFoundException('Rede social não encontrada');
    }

    // Remove a rede social
    await this.prisma.socialMedia.delete({
      where: { uuid: socialMediaUuid },
    });

    this.logger.log(
      `Rede social ${socialMediaUuid} removida com sucesso do usuário ${userId}`,
    );

    return this.getMyProfile(userId);
  }

  /**
   * Adiciona uma nova tag ao usuário
   */
  async addTag(
    userId: number,
    addTagData: AddTagDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se a tag já existe para o usuário
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        userId,
        label: addTagData.label,
      },
    });

    if (existingTag) {
      throw new BadRequestException('Tag já existe para este usuário');
    }

    // Adiciona a nova tag
    await this.prisma.tag.create({
      data: {
        userId,
        label: addTagData.label,
      },
    });

    // Sincronizar com Meilisearch
    try {
      await this.searchService.syncUserAfterChange(userId);
    } catch (error) {
      this.logger.warn(`Failed to sync user ${userId} to search index:`, error);
    }

    return this.getMyProfile(userId);
  }

  /**
   * Atualiza tags do usuário
   */
  async updateTags(
    userId: number,
    updateData: UpdateTagsDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateData.tags) {
      // Remove todas as tags existentes
      await this.prisma.tag.deleteMany({
        where: { userId },
      });

      // Adiciona as novas tags
      if (updateData.tags.length > 0) {
        await this.prisma.tag.createMany({
          data: updateData.tags.map((tag) => ({
            userId,
            label: tag.label,
          })),
        });
      }

      // Sincronizar com Meilisearch
      try {
        await this.searchService.syncUserAfterChange(userId);
      } catch (error) {
        this.logger.warn(
          `Failed to sync user ${userId} to search index:`,
          error,
        );
      }
    }

    return this.getMyProfile(userId);
  }

  /**
   * Deleta uma tag específica do usuário
   */
  async deleteTag(
    userId: number,
    tagUuid: string,
  ): Promise<UserProfileResponseDto> {
    this.logger.log(`Deletando tag ${tagUuid} do usuário ID: ${userId}`);

    const user = await this.findUserById(userId);
    if (!user) {
      this.logger.warn(`Usuário não encontrado para ID: ${userId}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se a tag existe e pertence ao usuário
    const tag = await this.prisma.tag.findFirst({
      where: {
        uuid: tagUuid,
        userId,
      },
    });

    if (!tag) {
      this.logger.warn(`Tag ${tagUuid} não encontrada para usuário ${userId}`);
      throw new NotFoundException('Tag não encontrada');
    }

    // Remove a tag
    await this.prisma.tag.delete({
      where: { uuid: tagUuid },
    });

    this.logger.log(`Tag ${tagUuid} removida com sucesso do usuário ${userId}`);

    // Sincronizar com Meilisearch
    try {
      await this.searchService.syncUserAfterChange(userId);
    } catch (error) {
      this.logger.warn(`Failed to sync user ${userId} to search index:`, error);
    }

    return this.getMyProfile(userId);
  }

  /**
   * Cria endereço do usuário (CEP obrigatório)
   */
  async createAddress(
    userId: number,
    createData: CreateAddressDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se já existe um endereço
    const existingAddress = await this.prisma.address.findUnique({
      where: { userId },
    });

    if (existingAddress) {
      throw new BadRequestException(
        'Usuário já possui um endereço. Use PUT para atualizar.',
      );
    }

    // Cria novo endereço
    await this.prisma.address.create({
      data: {
        userId,
        zipCode: createData.zipCode,
        street: createData.street,
        neighborhood: createData.neighborhood,
        city: createData.city,
        state: createData.state,
      },
    });

    // Sincronizar com Meilisearch
    try {
      await this.searchService.syncUserAfterChange(userId);
    } catch (error) {
      this.logger.warn(`Failed to sync user ${userId} to search index:`, error);
    }

    return this.getMyProfile(userId);
  }

  /**
   * Atualiza endereço do usuário (todos os campos opcionais)
   */
  async updateAddressDirect(
    userId: number,
    updateData: UpdateAddressDirectDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se existe endereço
    const existingAddress = await this.prisma.address.findUnique({
      where: { userId },
    });

    if (!existingAddress) {
      throw new NotFoundException(
        'Usuário não possui endereço. Use POST para criar.',
      );
    }

    // Monta o objeto de atualização apenas com campos fornecidos e não vazios
    const updateFields: any = {};
    if (updateData.zipCode !== undefined && updateData.zipCode !== '')
      updateFields.zipCode = updateData.zipCode;
    if (updateData.street !== undefined && updateData.street !== '')
      updateFields.street = updateData.street;
    if (updateData.neighborhood !== undefined && updateData.neighborhood !== '')
      updateFields.neighborhood = updateData.neighborhood;
    if (updateData.city !== undefined && updateData.city !== '')
      updateFields.city = updateData.city;
    if (updateData.state !== undefined && updateData.state !== '')
      updateFields.state = updateData.state;

    // Só atualiza se houver campos para atualizar
    if (Object.keys(updateFields).length > 0) {
      await this.prisma.address.update({
        where: { userId },
        data: updateFields,
      });

      // Sincronizar com Meilisearch
      try {
        await this.searchService.syncUserAfterChange(userId);
      } catch (error) {
        this.logger.warn(
          `Failed to sync user ${userId} to search index:`,
          error,
        );
      }
    }

    return this.getMyProfile(userId);
  }

  /**
   * Atualiza endereço do usuário (método legado)
   */
  async updateAddress(
    userId: number,
    updateData: UpdateAddressDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateData.address) {
      const existingAddress = await this.prisma.address.findUnique({
        where: { userId },
      });

      if (existingAddress) {
        // Atualiza endereço existente
        await this.prisma.address.update({
          where: { userId },
          data: {
            zipCode: updateData.address.zipCode,
            street: updateData.address.street,
            neighborhood: updateData.address.neighborhood,
            city: updateData.address.city,
            state: updateData.address.state,
          },
        });
      } else {
        // Cria novo endereço
        await this.prisma.address.create({
          data: {
            userId,
            zipCode: updateData.address.zipCode,
            street: updateData.address.street,
            neighborhood: updateData.address.neighborhood,
            city: updateData.address.city,
            state: updateData.address.state,
          },
        });
      }

      // Sincronizar com Meilisearch
      try {
        await this.searchService.syncUserAfterChange(userId);
      } catch (error) {
        this.logger.warn(
          `Failed to sync user ${userId} to search index:`,
          error,
        );
      }
    }

    return this.getMyProfile(userId);
  }

  /**
   * Remove endereço do usuário
   */
  async removeAddress(userId: number): Promise<UserProfileResponseDto> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.address.deleteMany({
      where: { userId },
    });

    // Sincronizar com Meilisearch
    try {
      await this.searchService.syncUserAfterChange(userId);
    } catch (error) {
      this.logger.warn(`Failed to sync user ${userId} to search index:`, error);
    }

    return this.getMyProfile(userId);
  }

  /**
   * Busca usuário por ID
   */
  private async findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Busca usuário por UUID com perfil
   */
  private async findUserByUuidWithProfile(uuid: string) {
    return (await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        student: {
          include: {
            curriculum: true,
          },
        },
        enterprise: true,
        socialMedia: true,
        tags: true,
        address: true,
        avatar: true,
        banner: true,
      },
    })) as UserWithFullProfile | null;
  }

  /**
   * Busca usuário com perfil básico
   */
  private async findUserWithProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        enterprise: true,
      },
    });
  }

  /**
   * Busca usuário com perfil completo
   */
  private async findUserWithFullProfile(
    userId: number,
  ): Promise<UserWithFullProfile | null> {
    return (await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            curriculum: true,
          },
        },
        enterprise: true,
        socialMedia: true,
        tags: true,
        address: true,
        avatar: true,
        banner: true,
      },
    })) as UserWithFullProfile | null;
  }

  /**
   * Busca estatísticas do usuário
   */
  private async getUserStats(userId: number): Promise<UserStats> {
    const [likesReceived, likesGiven, user] = await Promise.all([
      this.prisma.like.count({
        where: { receiverId: userId },
      }),
      this.prisma.like.count({
        where: { initiatorId: userId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          createdAt: true,
          updatedAt: true,
          name: true,
          description: true,
          birthDate: true,
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Calcula completude do perfil
    let completeness = 0;
    const fields = [
      user.name,
      user.description,
      user.birthDate,
      // Adicionar outros campos conforme necessário
    ];

    const filledFields = fields.filter((field) => field !== null).length;
    completeness = Math.round((filledFields / fields.length) * 100);

    return {
      totalLikesReceived: likesReceived,
      totalLikesGiven: likesGiven,
      profileCompleteness: completeness,
      joinedDate: user.createdAt,
      lastActiveDate: user.updatedAt,
    };
  }

  /**
   * Mapeia usuário para DTO privado (com dados sensíveis)
   */
  private mapToPrivateProfileDto(
    user: UserWithFullProfile,
    stats: UserStats,
    imageUrls: {
      avatarUrl?: string;
      bannerUrl?: string;
      curriculumUrl?: string;
      historyUrl?: string;
    },
  ): UserProfileResponseDto {
    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
      description: user.description || undefined,
      birthDate: user.birthDate?.toISOString(),
      isVerified: user.isVerified,
      isActive: user.isActive,
      isComplete: user.isComplete,
      avatarUrl: imageUrls.avatarUrl,
      bannerUrl: imageUrls.bannerUrl,
      student: user.student
        ? {
            uuid: user.student.uuid,
            course: user.student.course || undefined,
            registrationNumber: user.student.registrationNumber || undefined,
            lattes: user.student.lattes || undefined,
            curriculumUrl: imageUrls.curriculumUrl,
            historyUrl: imageUrls.historyUrl,
            createdAt: user.student.createdAt.toISOString(),
            updatedAt: user.student.updatedAt.toISOString(),
          }
        : undefined,
      enterprise: user.enterprise
        ? {
            uuid: user.enterprise.uuid,
            fantasyName: user.enterprise.fantasyName || undefined,
            cnpj: user.enterprise.cnpj || undefined,
            socialReason: user.enterprise.socialReason || undefined,
            createdAt: user.enterprise.createdAt.toISOString(),
            updatedAt: user.enterprise.updatedAt.toISOString(),
          }
        : undefined,
      socialMedia: user.socialMedia?.map((sm) => ({
        uuid: sm.uuid,
        type: sm.type,
        url: sm.url,
        createdAt: sm.createdAt.toISOString(),
        updatedAt: sm.updatedAt.toISOString(),
      })),
      tags: user.tags?.map((tag) => ({
        uuid: tag.uuid,
        label: tag.label,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      })),
      address: user.address
        ? {
            uuid: user.address.uuid,
            zipCode: user.address.zipCode,
            street: user.address.street || undefined,
            neighborhood: user.address.neighborhood || undefined,
            city: user.address.city || undefined,
            state: user.address.state || undefined,
            createdAt: user.address.createdAt.toISOString(),
            updatedAt: user.address.updatedAt.toISOString(),
          }
        : undefined,
      stats: {
        totalLikesReceived: stats.totalLikesReceived,
        totalLikesGiven: stats.totalLikesGiven,
        profileCompleteness: stats.profileCompleteness,
        joinedDate: stats.joinedDate.toISOString(),
        lastActiveDate: stats.lastActiveDate.toISOString(),
      },
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Mapeia usuário para DTO público (sem dados sensíveis)
   */
  private mapToPublicProfileDto(
    user: UserWithFullProfile,
    imageUrls: {
      avatarUrl?: string;
      bannerUrl?: string;
      curriculumUrl?: string;
      historyUrl?: string;
    },
  ): PublicUserProfileResponseDto {
    return {
      uuid: user.uuid,
      username: user.username,
      role: user.role,
      name: user.name || undefined,
      description: user.description || undefined,
      birthDate: user.birthDate?.toISOString(),
      isVerified: user.isVerified,
      isActive: user.isActive,
      avatarUrl: imageUrls.avatarUrl,
      bannerUrl: imageUrls.bannerUrl,
      student: user.student
        ? {
            uuid: user.student.uuid,
            course: user.student.course || undefined,
            registrationNumber: user.student.registrationNumber || undefined,
            lattes: user.student.lattes || undefined,
            curriculumUrl: imageUrls.curriculumUrl,
            historyUrl: imageUrls.historyUrl,
            createdAt: user.student.createdAt.toISOString(),
            updatedAt: user.student.updatedAt.toISOString(),
          }
        : undefined,
      enterprise: user.enterprise
        ? {
            uuid: user.enterprise.uuid,
            fantasyName: user.enterprise.fantasyName || undefined,
            cnpj: user.enterprise.cnpj || undefined,
            socialReason: user.enterprise.socialReason || undefined,
            createdAt: user.enterprise.createdAt.toISOString(),
            updatedAt: user.enterprise.updatedAt.toISOString(),
          }
        : undefined,
      socialMedia: user.socialMedia?.map((sm) => ({
        uuid: sm.uuid,
        type: sm.type,
        url: sm.url,
        createdAt: sm.createdAt.toISOString(),
        updatedAt: sm.updatedAt.toISOString(),
      })),
      tags: user.tags?.map((tag) => ({
        uuid: tag.uuid,
        label: tag.label,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      })),
      address: user.address
        ? {
            uuid: user.address.uuid,
            zipCode: user.address.zipCode,
            street: user.address.street || undefined,
            neighborhood: user.address.neighborhood || undefined,
            city: user.address.city || undefined,
            state: user.address.state || undefined,
            createdAt: user.address.createdAt.toISOString(),
            updatedAt: user.address.updatedAt.toISOString(),
          }
        : undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Mapeia usuário para DTO de preview (versão resumida)
   */
  private mapToPreviewDto(
    user: {
      uuid: string;
      username: string;
      role: string;
      name?: string | null;
      description?: string | null;
      isVerified: boolean;
      isActive: boolean;
      address?: {
        city?: string | null;
        state?: string | null;
      } | null;
      tags?: Array<{
        label: string;
      }>;
    },
    avatarUrl?: string,
    bannerUrl?: string,
  ): UserPreviewResponseDto {
    // Construir localização a partir do endereço
    let location: string | undefined;
    if (user.address?.city || user.address?.state) {
      const city = user.address.city || '';
      const state = user.address.state || '';
      location = `${city}${city && state ? ', ' : ''}${state}`.trim();
      if (location === '') location = undefined;
    }

    // Extrair nomes das tags (máximo 5)
    const mainTags = user.tags?.map((tag) => tag.label) || [];

    // Truncar descrição para preview (máximo 200 caracteres)
    let description = user.description;
    if (description && description.length > 200) {
      description = description.substring(0, 197) + '...';
    }

    return {
      uuid: user.uuid,
      username: user.username,
      role: user.role,
      name: user.name || undefined,
      description: description || undefined,
      avatarUrl: avatarUrl || null,
      bannerUrl: bannerUrl || null,
      isVerified: user.isVerified,
      isActive: user.isActive,
      mainTags: mainTags.length > 0 ? mainTags : undefined,
      location: location || undefined,
    };
  }

  /**
   * Exemplo de método para upload de avatar do usuário
   * Demonstra como usar o StorageService integrado
   */
  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    this.logger.log(`Iniciando upload de avatar para usuário ID: ${userId}`);

    // Faz upload do arquivo usando o StorageService
    const uploadResult = await this.storageService.uploadFile(
      file,
      'profile_picture', // Tipo de attachment
      userId,
    );

    // Aqui você poderia salvar a chave de storage no banco de dados
    // Por exemplo, atualizar o campo avatar do usuário com uploadResult.storageKey

    // Gera URL temporária para acesso ao arquivo
    const avatarUrl = await this.storageService.generateFileUrl(
      uploadResult.storageKey,
      3600, // URL válida por 1 hora
    );

    this.logger.log(
      `Upload de avatar concluído com sucesso para usuário ID: ${userId}`,
    );
    return { avatarUrl };
  }

  /**
   * Exemplo de método para upload de banner do usuário
   */
  async uploadBanner(
    userId: number,
    file: Express.Multer.File,
  ): Promise<{ bannerUrl: string }> {
    this.logger.log(`Iniciando upload de banner para usuário ID: ${userId}`);

    const uploadResult = await this.storageService.uploadFile(
      file,
      'banner_picture',
      userId,
    );

    const bannerUrl = await this.storageService.generateFileUrl(
      uploadResult.storageKey,
      3600,
    );

    this.logger.log(
      `Upload de banner concluído com sucesso para usuário ID: ${userId}`,
    );
    return { bannerUrl };
  }

  /**
   * Deleta completamente o perfil do usuário (soft delete)
   */
  async deleteMyProfile(userId: number): Promise<{ message: string }> {
    this.logger.log(`Deletando perfil do usuário ID: ${userId}`);

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`Usuário não encontrado para deleção: ID ${userId}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isDeleted) {
      this.logger.warn(
        `Tentativa de deletar usuário já deletado: ID ${userId}`,
      );
      throw new ConflictException('Usuário já foi deletado');
    }

    try {
      // Soft delete - apenas marca como deletado
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isDeleted: true,
          isActive: false,
        },
      });

      this.logger.log(`Usuário deletado com sucesso: ID ${userId}`);

      // Remover usuário do índice de busca
      try {
        await this.searchService.deleteUser(user.uuid);
        this.logger.log(`User ${userId} removed from search index`);
      } catch (error) {
        this.logger.warn(
          `Failed to remove user ${userId} from search index`,
          error,
        );
        // Não bloquear a deleção se a remoção do índice falhar
      }

      return { message: 'Perfil deletado com sucesso' };
    } catch (error) {
      this.logger.error(
        `Erro ao deletar usuário ${userId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
      throw new InternalServerErrorException('Falha ao deletar perfil');
    }
  }

  /**
   * Calcula a distância de Levenshtein entre duas strings
   */
  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Normaliza uma tag para comparação
   */
  private normalizeTag(tag: string): string {
    return tag
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
      .replace(/js$/, 'javascript') // ReactJS -> reactjavascript
      .replace(/css$/, 'styles'); // CSS -> styles
  }

  /**
   * Calcula a similaridade entre duas tags (0-1, onde 1 é idêntica)
   */
  private calculateTagSimilarity(tag1: string, tag2: string): number {
    const normalized1 = this.normalizeTag(tag1);
    const normalized2 = this.normalizeTag(tag2);

    // Se são idênticas após normalização
    if (normalized1 === normalized2) {
      return 1;
    }

    // Se uma contém a outra
    if (
      normalized1.includes(normalized2) ||
      normalized2.includes(normalized1)
    ) {
      return 0.8;
    }

    // Calcular similaridade baseada na distância de Levenshtein
    const maxLength = Math.max(normalized1.length, normalized2.length);
    if (maxLength === 0) return 1;

    const distance = this.calculateLevenshteinDistance(
      normalized1,
      normalized2,
    );
    const similarity = 1 - distance / maxLength;

    // Considerar similar se a similaridade for >= 70%
    return similarity >= 0.7 ? similarity : 0;
  }

  /**
   * Calcula o score de compatibilidade entre usuário atual e um candidato
   */
  private calculateUserCompatibilityScore(
    userTags: string[],
    candidateTags: { label: string }[],
  ): number {
    if (userTags.length === 0 || candidateTags.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let matchCount = 0;

    for (const userTag of userTags) {
      let bestMatch = 0;
      for (const candidateTag of candidateTags) {
        const similarity = this.calculateTagSimilarity(
          userTag,
          candidateTag.label,
        );
        bestMatch = Math.max(bestMatch, similarity);
      }

      if (bestMatch > 0) {
        totalScore += bestMatch;
        matchCount++;
      }
    }

    // Score final: média das melhores correspondências * fator de cobertura
    const averageScore = matchCount > 0 ? totalScore / matchCount : 0;
    const coverageFactor = matchCount / userTags.length; // Quantas tags do usuário foram "cobertas"

    return averageScore * coverageFactor;
  }

  /**
   * Busca usuários recomendados baseado nas tags do usuário atual com algoritmo de similaridade
   */
  async getRecommendedUsers(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{
    users: UserPreviewResponseDto[];
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    this.logger.log(
      `Buscando usuários recomendados para usuário ID: ${userId}`,
    );

    // Buscar o usuário atual com suas tags
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tags: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se o usuário não tem tags, retornar usuários aleatórios com papel diferente
    if (!currentUser.tags || currentUser.tags.length === 0) {
      this.logger.log(
        'Usuário sem tags, buscando usuários com papel diferente',
      );
      return this.getRecommendedUsersByRole(currentUser.role, limit, offset);
    }

    // Extrair labels das tags do usuário atual
    const userTagLabels = currentUser.tags.map((tag) => tag.label);
    this.logger.log(`Tags do usuário: ${userTagLabels.join(', ')}`);

    // Determinar o papel oposto para recomendação
    const oppositeRole =
      currentUser.role === 'student' ? 'enterprise' : 'student';

    // Buscar TODOS os usuários do papel oposto (sem filtrar por tags ainda)
    // Vamos aplicar o algoritmo de similaridade em memória para melhor controle
    const allCandidates = await this.prisma.user.findMany({
      where: {
        id: { not: userId }, // Excluir o próprio usuário
        role: oppositeRole, // Papel diferente
        isActive: true,
        isDeleted: false,
      },
      include: {
        tags: true,
        address: true,
        avatar: true,
        banner: true,
      },
    });

    this.logger.log(
      `Analisando ${allCandidates.length} candidatos para recomendação`,
    );

    // Calcular score de compatibilidade para cada candidato
    const candidatesWithScore = allCandidates
      .map((candidate) => ({
        user: candidate,
        score: this.calculateUserCompatibilityScore(
          userTagLabels,
          candidate.tags,
        ),
      }))
      .filter((item) => item.score > 0) // Apenas usuários com alguma compatibilidade
      .sort((a, b) => b.score - a.score); // Ordenar por score decrescente

    // Se não há candidatos com score > 0, usar usuários aleatórios
    if (candidatesWithScore.length === 0) {
      this.logger.log(
        'Nenhum usuário compatível encontrado, usando fallback aleatório',
      );
      return this.getRecommendedUsersByRole(currentUser.role, limit, offset);
    }

    // Aplicar paginação nos resultados ordenados por score
    const paginatedCandidates = candidatesWithScore.slice(
      offset,
      offset + limit,
    );

    this.logger.log(
      `Selecionados ${paginatedCandidates.length} usuários com scores: ${paginatedCandidates
        .map((c) => c.score.toFixed(3))
        .join(', ')}`,
    );

    // Converter para DTOs de preview
    const userPreviews = await Promise.all(
      paginatedCandidates.map(async ({ user }) => {
        const imageUrls = await this.getUserImageUrls(user.id);
        return this.mapToPreviewDto(
          user,
          imageUrls.avatarUrl || undefined,
          imageUrls.bannerUrl || undefined,
        );
      }),
    );

    const totalCount = candidatesWithScore.length;
    const hasNext = offset + limit < totalCount;
    const hasPrev = offset > 0;

    this.logger.log(
      `Retornando ${userPreviews.length} usuários recomendados de ${totalCount} compatíveis`,
    );

    return {
      users: userPreviews,
      total: totalCount,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Busca usuários recomendados apenas por papel (fallback quando não há tags)
   */
  private async getRecommendedUsersByRole(
    currentUserRole: string,
    limit: number,
    offset: number,
  ): Promise<{
    users: UserPreviewResponseDto[];
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const oppositeRole =
      currentUserRole === 'student' ? 'enterprise' : 'student';

    const users = await this.prisma.user.findMany({
      where: {
        role: oppositeRole,
        isActive: true,
        isDeleted: false,
      },
      include: {
        tags: true,
        address: true,
        avatar: true,
        banner: true,
      },
      skip: offset,
      take: limit,
    });

    const totalCount = await this.prisma.user.count({
      where: {
        role: oppositeRole,
        isActive: true,
        isDeleted: false,
      },
    });

    const userPreviews = await Promise.all(
      users.map(async (user) => {
        const imageUrls = await this.getUserImageUrls(user.id);
        return this.mapToPreviewDto(
          user,
          imageUrls.avatarUrl || undefined,
          imageUrls.bannerUrl || undefined,
        );
      }),
    );

    const hasNext = offset + limit < totalCount;
    const hasPrev = offset > 0;

    return {
      users: userPreviews,
      total: totalCount,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Exemplo de método para deletar arquivo do usuário
   */
  async deleteUserFile(storageKey: string): Promise<void> {
    this.logger.log(`Deletando arquivo com chave: ${storageKey}`);

    await this.storageService.deleteFile(storageKey);

    this.logger.log(`Arquivo deletado com sucesso: ${storageKey}`);
  }
}
