import { Controller, Get, Param, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Public } from '../auth/decotaros/public.decorator';
import { JobResponseDto } from './dtos/job-response.dto';
import { CustomRequest } from '../auth/interfaces/custon_request';

@ApiTags('Jobs - Public')
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private readonly jobsService: JobsService) {}

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
