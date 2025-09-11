import { Controller, Get, Param, Query, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Public } from '../auth/decotaros/public.decorator';
import { JobStatus } from '@prisma/client';
import { JobResponseDto, JobListResponseDto } from './dtos/job-response.dto';
import { CustomRequest } from '../auth/interfaces/custon_request';

@ApiTags('Jobs - Public')
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private readonly jobsService: JobsService) {}

  /**
   * Listar vagas públicas
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar vagas públicas' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  @ApiQuery({ name: 'offset', type: Number, required: false, example: 0 })
  async listJobs(
    @Query('status') status?: JobStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Req() req?: CustomRequest,
  ): Promise<JobListResponseDto> {
    const userId = req?.user?.sub;

    return this.jobsService.listJobs(
      userId,
      status,
      undefined,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
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
