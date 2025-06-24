import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decotaros/public.decorator';
import { SearchResultDto } from './dtos/search_result.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @ApiOperation({ summary: 'Search users' })
  @ApiOkResponse({
    description: 'The list of users',
    type: SearchResultDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'The page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description:
      'The number of items per page. Default is 10. Max is 20 and min is 1',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':query')
  async search(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('query') query: string,
  ): Promise<SearchResultDto> {
    const result = await this.searchService.users(
      { searchTerm: query },
      page,
      limit,
    );
    return {
      users: result.items,
      total: result.total,
    };
  }
}
