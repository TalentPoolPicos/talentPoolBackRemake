import { Controller, Get, Param, Req, Logger, Query } from '@nestjs/common';
import { ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Public } from '../auth/decotaros/public.decorator';
import {
  JobResponseDto,
  PublishedJobListResponseDto,
} from './dtos/job-response.dto';
import { CustomRequest } from '../auth/interfaces/custon_request';

@ApiTags('Jobs - Public')
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private readonly jobsService: JobsService) {}

  /**
   * Listar vagas publicadas (público) com paginação
   */
  @Get('published')
  @Public()
  @ApiOperation({ summary: 'Listar vagas publicadas (público) com paginação' })
  @ApiOkResponse({ type: PublishedJobListResponseDto })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de itens por página (default 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset/pular itens (default 0)',
    example: 0,
  })
  async listPublishedJobs(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<PublishedJobListResponseDto> {
    // Reutiliza listJobs passando status=published
    const fullList = await this.jobsService.listJobs(
      undefined,
      'published' as any,
      undefined,
      limit ?? 20,
      offset ?? 0,
    );

    // Mapear JobResponseDto -> JobPreviewDto para resposta pública
    const previews = fullList.jobs.map((job) => ({
      uuid: job.uuid,
      title: job.title,
      status: job.status,
      createdAt: job.createdAt,
      publishedAt: job.publishedAt,
      company: job.company,
    }));

    return {
      jobs: previews,
      total: fullList.total,
      limit: fullList.limit,
      offset: fullList.offset,
    };
  }

  /**
   * Obter detalhes de uma vaga específica
   */
  @Get(':uuid')
  @Public()
  @ApiOperation({ summary: 'Obter vaga por UUID' })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da vaga' })
  async getJobByUuid(
    @Param('uuid') uuid: string,
    @Req() req?: CustomRequest,
  ): Promise<JobResponseDto> {
    const userId = req?.user?.sub;
    return this.jobsService.getJobByUuid(uuid, userId);
  }
}
