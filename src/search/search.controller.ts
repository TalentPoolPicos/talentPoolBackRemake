import { Controller, Get, Query, Logger, ValidationPipe } from '@nestjs/common';
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
  SearchJobsDto,
  SearchJobsResponseDto,
} from './dtos/search.dto';

@ApiTags('Search - Public')
@Public()
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

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
    summary: 'Pesquisar vagas',
    description:
      'Realiza pesquisa de vagas ativas por termo (busca apenas no título)',
  })
  @ApiQuery({
    name: 'q',
    description: 'Termo de pesquisa (busca apenas no título da vaga)',
    required: false,
    example: 'desenvolvedor frontend react',
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
    description: 'Lista de vagas encontradas',
    type: SearchJobsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de pesquisa inválidos',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor de busca',
  })
  @Get('jobs')
  async searchJobs(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    searchDto: SearchJobsDto,
  ): Promise<SearchJobsResponseDto> {
    this.logger.log(`Searching jobs with query: ${JSON.stringify(searchDto)}`);

    const { q = '', limit = 20, offset = 0 } = searchDto;

    const result: SearchJobsResponseDto = await this.searchService.searchJobs(
      q,
      {
        limit,
        offset,
      },
    );

    this.logger.log(`Job search completed: ${result.hits.length} jobs found`);

    return result;
  }
}
