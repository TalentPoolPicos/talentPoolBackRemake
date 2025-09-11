import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import {
  SearchOptions,
  MeilisearchResponse,
  JobSearchResponse,
  SearchableUser,
  SearchableJob,
} from './dtos/search.dto';
import { UserPreviewResponseDto } from '../users/dtos/user-response.dto';
import { JobPreviewDto } from '../jobs/dtos/job-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { JobStatus } from '@prisma/client';

// Helper function para mapear resultados do Meilisearch
function mapHitToUserPreview(hit: Record<string, any>): UserPreviewResponseDto {
  return {
    uuid: hit.uuid as string,
    username: hit.username as string,
    role: hit.role as string,
    name: hit.name as string | undefined,
    description: hit.description as string | undefined,
    avatarUrl: hit.avatarUrl as string | null | undefined,
    bannerUrl: hit.bannerUrl as string | null | undefined,
    isVerified: hit.isVerified as boolean,
    isActive: hit.isActive as boolean,
    mainTags: hit.tags ? (hit.tags as string[]).slice(0, 5) : undefined,
    location: hit.location as string | undefined,
  };
}

// Helper function para mapear jobs do Meilisearch
function mapHitToJobPreview(hit: Record<string, any>): JobPreviewDto {
  return {
    uuid: hit.uuid as string,
    title: hit.title as string,
    status: hit.status as JobStatus,
    createdAt: hit.createdAt as string,
    publishedAt: hit.publishedAt as string | undefined,
    company: {
      uuid: hit.companyUuid as string,
      name: hit.companyName as string,
      username: hit.companyUsername as string,
      avatarUrl: hit.companyAvatarUrl as string | null | undefined,
    },
  };
}
@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;
  private readonly userIndex = 'users';
  private readonly jobIndex = 'jobs';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {
    const host = this.configService.get<string>('MEILI_HOST');
    const apiKey = this.configService.get<string>('MEILI_MASTER_KEY');

    if (!host) {
      throw new Error('MEILI_HOST is required');
    }

    this.client = new MeiliSearch({
      host,
      apiKey,
    });
  }

  async onModuleInit() {
    try {
      await this.initializeIndexes();
      await this.syncUsersFromDatabase();
      await this.syncJobsFromDatabase();
      this.logger.log('Meilisearch initialized and synced successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Meilisearch:', error);
    }
  }

  private async initializeIndexes() {
    try {
      // Criar índice de usuários se não existir
      await this.client.createIndex(this.userIndex, { primaryKey: 'uuid' });
      this.logger.log(`Index '${this.userIndex}' created`);
    } catch (error: unknown) {
      const isIndexExistsError =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'index_already_exists';

      if (isIndexExistsError) {
        this.logger.log(`Index '${this.userIndex}' already exists`);
      } else {
        throw error;
      }
    }

    try {
      // Criar índice de jobs se não existir
      await this.client.createIndex(this.jobIndex, { primaryKey: 'uuid' });
      this.logger.log(`Index '${this.jobIndex}' created`);
    } catch (error: unknown) {
      const isIndexExistsError =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'index_already_exists';

      if (isIndexExistsError) {
        this.logger.log(`Index '${this.jobIndex}' already exists`);
      } else {
        throw error;
      }
    }

    // Configurar atributos do índice de usuários
    const userIndex = this.client.index(this.userIndex);
    await userIndex.updateSearchableAttributes([
      'username',
      'name',
      'email',
      'description',
      'tags',
      'location',
    ]);

    await userIndex.updateFilterableAttributes([
      'role',
      'isVerified',
      'isActive',
      'location',
      'tags',
    ]);

    await userIndex.updateSortableAttributes(['username', 'name', 'createdAt']);

    // Configurar atributos do índice de jobs
    const jobIndex = this.client.index(this.jobIndex);
    await jobIndex.updateSearchableAttributes(['title']);

    await jobIndex.updateFilterableAttributes(['status', 'companyUuid']);

    await jobIndex.updateSortableAttributes([
      'createdAt',
      'publishedAt',
      'title',
    ]);

    this.logger.log('Search attributes configured');
  }

  async addUser(userData: SearchableUser): Promise<void> {
    try {
      const index = this.client.index(this.userIndex);
      await index.addDocuments([userData]);
      this.logger.log(`User ${userData.username} added to search index`);
    } catch (error) {
      this.logger.error(`Error adding user to search index:`, error);
      throw error;
    }
  }

  async updateUser(userData: SearchableUser): Promise<void> {
    try {
      const index = this.client.index(this.userIndex);
      await index.updateDocuments([userData]);
      this.logger.log(`User ${userData.username} updated in search index`);
    } catch (error) {
      this.logger.error(`Error updating user in search index:`, error);
      throw error;
    }
  }

  async deleteUser(uuid: string) {
    try {
      const index = this.client.index(this.userIndex);
      await index.deleteDocument(uuid);
      this.logger.log(`User ${uuid} deleted from search index`);
    } catch (error) {
      this.logger.error(`Error deleting user from search index:`, error);
      throw error;
    }
  }

  async addJob(jobData: SearchableJob): Promise<void> {
    try {
      const index = this.client.index(this.jobIndex);
      await index.addDocuments([jobData]);
      this.logger.log(`Job ${jobData.title} added to search index`);
    } catch (error) {
      this.logger.error(`Error adding job to search index:`, error);
      throw error;
    }
  }

  async updateJob(jobData: SearchableJob): Promise<void> {
    try {
      const index = this.client.index(this.jobIndex);
      await index.updateDocuments([jobData]);
      this.logger.log(`Job ${jobData.title} updated in search index`);
    } catch (error) {
      this.logger.error(`Error updating job in search index:`, error);
      throw error;
    }
  }

  async deleteJob(uuid: string) {
    try {
      const index = this.client.index(this.jobIndex);
      await index.deleteDocument(uuid);
      this.logger.log(`Job ${uuid} deleted from search index`);
    } catch (error) {
      this.logger.error(`Error deleting job from search index:`, error);
      throw error;
    }
  }

  async searchUsers(
    query: string,
    options: SearchOptions,
  ): Promise<MeilisearchResponse> {
    try {
      const index = this.client.index(this.userIndex);

      const searchOptions = {
        limit: options.limit,
        offset: options.offset,
        attributesToRetrieve: [
          'uuid',
          'username',
          'name',
          'description',
          'role',
          'isVerified',
          'isActive',
          'location',
          'tags',
          'avatarUrl',
          'bannerUrl',
        ],
        ...(options.filter && { filter: options.filter }),
      };

      const result = await index.search(query, searchOptions);

      this.logger.log(
        `Search completed: ${result.hits?.length || 0} results found`,
      );

      return {
        hits: (result.hits || []).map(mapHitToUserPreview),
        total: result.estimatedTotalHits || 0,
        query: result.query || query,
        processingTimeMs: result.processingTimeMs || 0,
        limit: result.limit || options.limit,
        offset: result.offset || options.offset,
      };
    } catch (error) {
      this.logger.error(`Error searching users:`, error);
      throw error;
    }
  }

  async searchJobs(
    query: string,
    options: SearchOptions,
  ): Promise<JobSearchResponse> {
    try {
      const index = this.client.index(this.jobIndex);

      const searchOptions = {
        limit: options.limit,
        offset: options.offset,
        attributesToRetrieve: [
          'uuid',
          'title',
          'status',
          'createdAt',
          'publishedAt',
          'companyUuid',
          'companyName',
          'companyUsername',
          'companyAvatarUrl',
        ],
        filter: 'status = published',
        sort: ['publishedAt:desc'],
      };

      const result = await index.search(query, searchOptions);

      this.logger.log(
        `Job search completed: ${result.hits?.length || 0} results found`,
      );

      return {
        hits: (result.hits || []).map(mapHitToJobPreview),
        total: result.estimatedTotalHits || 0,
        query: result.query || query,
        processingTimeMs: result.processingTimeMs || 0,
        limit: result.limit || options.limit,
        offset: result.offset || options.offset,
      };
    } catch (error) {
      this.logger.error(`Error searching jobs:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza todos os usuários do banco de dados com o Meilisearch
   */
  async syncUsersFromDatabase(): Promise<void> {
    try {
      this.logger.log('Starting database sync...');

      // Buscar todos os usuários ativos do banco
      const users = await this.prisma.user.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          tags: true,
          address: true,
        },
      });

      if (users.length === 0) {
        this.logger.log('No users found in database');
        return;
      }

      // Converter usuários para formato do Meilisearch
      const searchableUsers: SearchableUser[] = await Promise.all(
        users.map((user) => this.mapUserToSearchableUser(user)),
      );

      // Adicionar todos os usuários ao índice
      const index = this.client.index(this.userIndex);
      await index.addDocuments(searchableUsers);

      this.logger.log(`Synced ${searchableUsers.length} users to search index`);
    } catch (error) {
      this.logger.error('Error syncing users from database:', error);
      throw error;
    }
  }

  /**
   * Sincroniza todas as vagas ativas do banco de dados com o Meilisearch
   */
  async syncJobsFromDatabase(): Promise<void> {
    try {
      this.logger.log('Starting jobs database sync...');

      // Buscar todas as vagas publicadas do banco
      const jobs = await this.prisma.job.findMany({
        where: {
          status: 'published',
        },
        include: {
          enterprise: {
            include: {
              user: true,
            },
          },
        },
      });

      if (jobs.length === 0) {
        this.logger.log('No published jobs found in database');
        return;
      }

      // Converter vagas para formato do Meilisearch
      const searchableJobs: SearchableJob[] = await Promise.all(
        jobs.map((job) => this.mapJobToSearchableJob(job)),
      );

      // Adicionar todas as vagas ao índice
      const index = this.client.index(this.jobIndex);
      await index.addDocuments(searchableJobs);

      this.logger.log(`Synced ${searchableJobs.length} jobs to search index`);
    } catch (error) {
      this.logger.error('Error syncing jobs from database:', error);
      throw error;
    }
  }

  /**
   * Mapeia um usuário do banco para o formato SearchableUser
   */
  private async mapUserToSearchableUser(user: {
    id: number;
    uuid: string;
    username: string;
    name: string | null;
    email: string;
    role: string;
    description: string | null;
    isVerified: boolean;
    isActive: boolean;
    tags?: { label: string }[];
    address?: {
      city: string | null;
      state: string | null;
    } | null;
  }): Promise<SearchableUser> {
    const location = user.address
      ? `${user.address.city || ''}, ${user.address.state || ''}`
          .trim()
          .replace(/^,|,$/, '')
      : undefined;

    // Gerar URLs corretas usando consultas diretas aos attachments
    const [avatarUrl, bannerUrl] = await Promise.all([
      this.getAvatarUrl(user.id),
      this.getBannerUrl(user.id),
    ]);

    return {
      uuid: user.uuid,
      username: user.username,
      name: user.name || undefined,
      email: user.email,
      role: user.role.toLowerCase(),
      description: user.description || undefined,
      tags: user.tags?.map((tag) => tag.label) || [],
      location: location || undefined,
      avatarUrl: avatarUrl || null,
      bannerUrl: bannerUrl || null,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  }

  /**
   * Mapeia uma vaga do banco para o formato SearchableJob
   */
  private async mapJobToSearchableJob(job: {
    id: number;
    uuid: string;
    title: string;
    status: string;
    createdAt: Date;
    publishedAt: Date | null;
    enterprise: {
      user: {
        id: number;
        uuid: string;
        username: string;
        name: string | null;
      };
    };
  }): Promise<SearchableJob> {
    // Gerar URL do avatar da empresa
    const companyAvatarUrl = await this.getAvatarUrl(job.enterprise.user.id);

    return {
      id: job.id,
      uuid: job.uuid,
      title: job.title,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      publishedAt: job.publishedAt?.toISOString(),
      companyUuid: job.enterprise.user.uuid,
      companyName: job.enterprise.user.name || job.enterprise.user.username,
      companyUsername: job.enterprise.user.username,
      companyAvatarUrl: companyAvatarUrl || null,
    };
  }

  /**
   * Sincroniza um usuário específico após criação/atualização
   */
  async syncUserAfterChange(userId: number): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          tags: true,
          address: true,
        },
      });

      if (!user) {
        this.logger.warn(`User with ID ${userId} not found for sync`);
        return;
      }

      if (user.isDeleted) {
        // Se o usuário foi deletado, remover do índice
        await this.deleteUser(user.uuid);
        return;
      }

      // Converter e atualizar no índice
      const searchableUser = await this.mapUserToSearchableUser(user);
      await this.addUser(searchableUser);

      this.logger.log(`User ${user.username} synced to search index`);
    } catch (error) {
      this.logger.error(`Error syncing user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza uma vaga específica após criação/atualização
   */
  async syncJobAfterChange(jobId: number): Promise<void> {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        include: {
          enterprise: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!job) {
        this.logger.warn(`Job with ID ${jobId} not found for sync`);
        return;
      }

      if (job.status !== 'published') {
        // Se a vaga não está publicada, remover do índice
        await this.deleteJob(job.uuid);
        return;
      }

      // Converter e atualizar no índice
      const searchableJob = await this.mapJobToSearchableJob(job);
      await this.addJob(searchableJob);

      this.logger.log(`Job ${job.title} synced to search index`);
    } catch (error) {
      this.logger.error(`Error syncing job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Gera URL para avatar do usuário
   */
  private async getAvatarUrl(userId: number): Promise<string | null> {
    try {
      const attachment = await this.prisma.attachment.findFirst({
        where: {
          avatarUserId: userId,
          type: 'profile_picture',
        },
      });

      if (!attachment) {
        return null;
      }

      return await this.storageService.generateFileUrl(
        attachment.storageKey,
        3600,
      );
    } catch (error) {
      this.logger.warn(`Error getting avatar URL for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Gera URL para banner do usuário
   */
  private async getBannerUrl(userId: number): Promise<string | null> {
    try {
      const attachment = await this.prisma.attachment.findFirst({
        where: {
          bannerUserId: userId,
          type: 'banner_picture',
        },
      });

      if (!attachment) {
        return null;
      }

      return await this.storageService.generateFileUrl(
        attachment.storageKey,
        3600,
      );
    } catch (error) {
      this.logger.warn(`Error getting banner URL for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Obtém estatísticas do índice de busca
   */
  async getIndexStats(): Promise<{
    numberOfDocuments: number;
  }> {
    try {
      const index = this.client.index(this.userIndex);
      const stats = await index.getStats();

      return {
        numberOfDocuments: stats.numberOfDocuments,
      };
    } catch (error) {
      this.logger.error('Error getting index stats:', error);
      throw error;
    }
  }

  /**
   * Verifica se o Meilisearch está saudável
   */
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return health.status === 'available';
    } catch (error) {
      this.logger.error('Error checking Meilisearch health:', error);
      return false;
    }
  }
}
