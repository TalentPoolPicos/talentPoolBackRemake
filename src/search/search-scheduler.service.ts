import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SearchService } from './search.service';

@Injectable()
export class SearchSchedulerService {
  private readonly logger = new Logger(SearchSchedulerService.name);

  constructor(private readonly searchService: SearchService) {}

  /**
   * Tarefa agendada que executa a cada 2 horas
   * Sincroniza todos os usuários do banco de dados com o Meilisearch
   */
  @Cron('0 */2 * * *', {
    name: 'sync-users-to-search',
    timeZone: 'America/Fortaleza',
  })
  async syncUsersToSearchIndex(): Promise<void> {
    this.logger.log(
      '🔄 Iniciando sincronização agendada dos usuários com Meilisearch',
    );

    try {
      const startTime = Date.now();

      // Executar sincronização completa
      await this.searchService.syncUsersFromDatabase();

      const executionTime = Date.now() - startTime;
      this.logger.log(
        `✅ Sincronização agendada concluída com sucesso em ${executionTime}ms`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Erro durante sincronização agendada com Meilisearch',
        error instanceof Error ? error.stack : error,
      );

      // Não relançar o erro para não quebrar o agendador
      // Log detalhado para análise posterior
      this.logger.error(
        `Detalhes do erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Tarefa agendada que executa uma vez por dia às 03:00
   * Realiza limpeza e otimização do índice de busca
   */
  @Cron('0 3 * * *', {
    name: 'optimize-search-index',
    timeZone: 'America/Fortaleza',
  })
  async optimizeSearchIndex(): Promise<void> {
    this.logger.log('🔧 Iniciando otimização agendada do índice de busca');

    try {
      const startTime = Date.now();

      // Obter estatísticas do índice antes da otimização
      const stats = await this.searchService.getIndexStats();
      this.logger.log(
        `📊 Estatísticas do índice antes da otimização: ${JSON.stringify(stats)}`,
      );

      // Executar sincronização completa (que também otimiza)
      await this.searchService.syncUsersFromDatabase();

      const executionTime = Date.now() - startTime;
      this.logger.log(
        `✅ Otimização do índice concluída com sucesso em ${executionTime}ms`,
      );
    } catch (error) {
      this.logger.error(
        '❌ Erro durante otimização agendada do índice de busca',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * Tarefa de monitoramento que executa a cada 30 minutos
   * Verifica a saúde do Meilisearch e logs estatísticas
   */
  @Cron('*/30 * * * *', {
    name: 'health-check-search',
    timeZone: 'America/Fortaleza',
  })
  async healthCheckSearch(): Promise<void> {
    try {
      const isHealthy = await this.searchService.isHealthy();

      if (isHealthy) {
        // Log a cada 2 horas para não poluir os logs
        const currentMinute = new Date().getMinutes();
        if (currentMinute === 0 || currentMinute === 30) {
          const stats = await this.searchService.getIndexStats();
          this.logger.log(
            `💚 Meilisearch saudável - Documentos indexados: ${stats.numberOfDocuments}`,
          );
        }
      } else {
        this.logger.warn('⚠️ Meilisearch não está respondendo adequadamente');
      }
    } catch (error) {
      this.logger.error(
        '❌ Erro durante verificação de saúde do Meilisearch',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
