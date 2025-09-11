import {
  Controller,
  Get,
  Post,
  Query,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Public } from '../auth/decotaros/public.decorator';
import { SearchService } from './search.service';
import { SearchSchedulerService } from './search-scheduler.service';
import { SearchUsersDto, SearchUsersResponseDto } from './dtos/search.dto';

@ApiTags('Pesquisa')
@Public()
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly searchSchedulerService: SearchSchedulerService,
  ) {}

  @ApiOperation({
    summary: 'Pesquisar usuários',
    description:
      'Realiza pesquisa de usuários por termo (username, email, descrição, localização, tags) com filtro opcional por papel',
  })
  @ApiQuery({
    name: 'q',
    description:
      'Termo de pesquisa (busca em username, email, descrição, localização e tags)',
    required: false,
    example: 'João developer React',
  })
  @ApiQuery({
    name: 'role',
    description: 'Filtro por papel do usuário',
    required: false,
    enum: ['student', 'enterprise'],
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número de resultados por página (1-100)',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset para paginação',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiOkResponse({
    description: 'Pesquisa realizada com sucesso',
    type: SearchUsersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de pesquisa inválidos',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno no servidor de pesquisa',
  })
  @Get('users')
  async searchUsers(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    searchDto: SearchUsersDto,
  ): Promise<SearchUsersResponseDto> {
    this.logger.log(`Searching users with query: ${JSON.stringify(searchDto)}`);

    const { q = '', role, limit = 20, offset = 0 } = searchDto;

    // Construir filtros simples
    const filters: string[] = [];

    if (role) {
      filters.push(`role = "${role}"`);
    }

    // Sempre filtrar apenas usuários ativos
    filters.push('isActive = true');

    const filter = filters.length > 0 ? filters.join(' AND ') : undefined;

    const result: SearchUsersResponseDto = await this.searchService.searchUsers(
      q,
      {
        filter,
        limit,
        offset,
      },
    );

    this.logger.log(`Search completed: ${result.hits.length} users found`);

    return result;
  }

  @ApiOperation({
    summary: 'Executar sincronização manual',
    description:
      'Executa manualmente a sincronização de usuários com Meilisearch',
  })
  @ApiOkResponse({
    description: 'Sincronização executada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        executionTime: { type: 'number' },
      },
    },
  })
  @Post('sync')
  async manualSync(): Promise<{ message: string; executionTime: number }> {
    this.logger.log('Manual sync requested');
    const startTime = Date.now();

    await this.searchSchedulerService.syncUsersToSearchIndex();

    const executionTime = Date.now() - startTime;
    return {
      message: 'Sincronização manual executada com sucesso',
      executionTime,
    };
  }

  @ApiOperation({
    summary: 'Obter estatísticas do índice',
    description: 'Retorna estatísticas atuais do índice de busca',
  })
  @ApiOkResponse({
    description: 'Estatísticas obtidas com sucesso',
    schema: {
      type: 'object',
      properties: {
        numberOfDocuments: { type: 'number' },
        isHealthy: { type: 'boolean' },
      },
    },
  })
  @Get('stats')
  async getStats(): Promise<{
    numberOfDocuments: number;
    isHealthy: boolean;
  }> {
    const [stats, isHealthy] = await Promise.all([
      this.searchService.getIndexStats(),
      this.searchService.isHealthy(),
    ]);

    return {
      numberOfDocuments: stats.numberOfDocuments,
      isHealthy,
    };
  }
}
