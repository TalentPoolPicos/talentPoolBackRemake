import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UserImageService } from './user-image.service';
import {
  UserWithFullProfile,
  PrivateUserProfile,
  PublicUserProfile,
  UserStats,
} from './interfaces/user-profile.interface';
import {
  UpdateProfileDto,
  UpdateStudentProfileDto,
  UpdateEnterpriseProfileDto,
  UpdateSocialMediaDto,
  UpdateTagsDto,
  UpdateAddressDto,
  SocialMediaDto,
  TagDto,
  AddressDto,
} from './dtos/update-profile.dto';
import {
  UserProfileResponseDto,
  PublicUserProfileResponseDto,
  UserStatsResponseDto,
} from './dtos/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private userImageService: UserImageService,
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

    const updatePayload: any = {};

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

    const updatePayload: any = {};

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

    const updatePayload: any = {};

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

    return this.getMyProfile(userId);
  }

  /**
   * Atualiza endereço do usuário
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
   * Exemplo de método para deletar arquivo do usuário
   */
  async deleteUserFile(storageKey: string): Promise<void> {
    this.logger.log(`Deletando arquivo com chave: ${storageKey}`);

    await this.storageService.deleteFile(storageKey);

    this.logger.log(`Arquivo deletado com sucesso: ${storageKey}`);
  }
}
