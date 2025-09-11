import { Controller, Get, Query, Logger } from '@nestjs/common';
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
import {
  SearchUsersDto,
  SearchUsersResponseDto,
  SearchStatsResponseDto,
} from './dtos/search.dto';

@ApiTags('Pesquisa')
@Public()
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({
    summary: 'Pesquisar usuários',
    description:
      'Realiza pesquisa de usuários usando Meilisearch com filtros avançados e paginação',
  })
  @ApiQuery({
    name: 'q',
    description: 'Termo de pesquisa',
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
    name: 'isVerified',
    description: 'Filtrar apenas usuários verificados',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'location',
    description: 'Filtro por localização',
    required: false,
    example: 'Fortaleza, CE',
  })
  @ApiQuery({
    name: 'tags',
    description: 'Filtro por tags (separadas por vírgula)',
    required: false,
    example: 'React,Node.js,TypeScript',
  })
  @ApiQuery({
    name: 'sort',
    description: 'Ordenação dos resultados',
    required: false,
    example: 'username:asc',
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
    @Query() searchDto: SearchUsersDto,
  ): Promise<SearchUsersResponseDto> {
    this.logger.log(`Searching users with query: ${JSON.stringify(searchDto)}`);

    const {
      q = '',
      role,
      isVerified,
      location,
      tags,
      sort,
      limit = 20,
      offset = 0,
    } = searchDto;

    // Construir filtros
    const filters: string[] = [];

    if (role) {
      filters.push(`role = "${role}"`);
    }

    if (isVerified !== undefined) {
      filters.push(`isVerified = ${isVerified}`);
    }

    // Sempre filtrar apenas usuários ativos
    filters.push('isActive = true');

    if (location) {
      filters.push(`location = "${location}"`);
    }

    if (tags) {
      const tagList = tags.split(',').map((tag) => tag.trim());
      const tagFilters = tagList.map((tag) => `tags = "${tag}"`);
      filters.push(`(${tagFilters.join(' OR ')})`);
    }

    const filter = filters.length > 0 ? filters.join(' AND ') : undefined;

    const result = await this.searchService.searchUsers(q, {
      filter,
      limit,
      offset,
      sort,
    });

    this.logger.log(`Search completed: ${result.hits.length} users found`);

    return result;
  }

  @ApiOperation({
    summary: 'Obter estatísticas de pesquisa',
    description: 'Retorna estatísticas do índice de pesquisa de usuários',
  })
  @ApiOkResponse({
    description: 'Estatísticas obtidas com sucesso',
    type: SearchStatsResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno no servidor de pesquisa',
  })
  @Get('stats')
  async getSearchStats(): Promise<SearchStatsResponseDto> {
    this.logger.log('Getting search statistics');

    const stats = await this.searchService.getSearchStats();

    this.logger.log('Search statistics retrieved successfully');

    return stats;
  }
}
