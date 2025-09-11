import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;
  private readonly userIndex = 'users';

  constructor(private readonly configService: ConfigService) {
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
      this.logger.log('Meilisearch initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Meilisearch:', error);
    }
  }

  private async initializeIndexes() {
    try {
      // Criar índice de usuários se não existir
      await this.client.createIndex(this.userIndex, { primaryKey: 'uuid' });
      this.logger.log(`Index '${this.userIndex}' created`);
    } catch (error: any) {
      if (error.code === 'index_already_exists') {
        this.logger.log(`Index '${this.userIndex}' already exists`);
      } else {
        throw error;
      }
    }

    // Configurar atributos searchable e filterable
    const index = this.client.index(this.userIndex);

    await index.updateSearchableAttributes([
      'username',
      'name',
      'description',
      'tags',
      'location',
    ]);

    await index.updateFilterableAttributes([
      'role',
      'isVerified',
      'isActive',
      'location',
      'tags',
    ]);

    await index.updateSortableAttributes(['username', 'name', 'createdAt']);

    this.logger.log('Search attributes configured');
  }

  async addUser(userData: any) {
    try {
      const index = this.client.index(this.userIndex);
      await index.addDocuments([userData]);
      this.logger.log(`User ${userData.username} added to search index`);
    } catch (error) {
      this.logger.error(`Error adding user to search index:`, error);
      throw error;
    }
  }

  async updateUser(userData: any) {
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

  async searchUsers(query: string, options: any = {}): Promise<any> {
    try {
      const index = this.client.index(this.userIndex);

      const searchOptions: any = {
        limit: options.limit || 20,
        offset: options.offset || 0,
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
      };

      if (options.filter) {
        searchOptions.filter = options.filter;
      }

      if (options.sort) {
        searchOptions.sort = options.sort;
      }

      const result: any = await index.search(query, searchOptions);

      this.logger.log(
        `Search completed: ${result.hits?.length || 0} results found`,
      );

      return {
        hits: result.hits || [],
        total: result.estimatedTotalHits || 0,
        query: result.query || query,
        processingTimeMs: result.processingTimeMs || 0,
        limit: result.limit || options.limit || 20,
        offset: result.offset || options.offset || 0,
      };
    } catch (error) {
      this.logger.error(`Error searching users:`, error);
      throw error;
    }
  }

  async getSearchStats(): Promise<any> {
    try {
      const index = this.client.index(this.userIndex);
      const stats: any = await index.getStats();
      return stats;
    } catch (error) {
      this.logger.error(`Error getting search stats:`, error);
      throw error;
    }
  }
}
