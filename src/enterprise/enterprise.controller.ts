import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EnterpriseService } from './enterprise.service';
import { FilesService } from 'src/minio/file.service';
import { Public } from 'src/auth/decotaros/public.decorator';
import { EnterprisePageDto } from './dtos/enterprise_page.dto';
import { EnterpriseAdapter } from './enterprise.adapter';
import { PartialEnterpriseDto } from './dtos/partial_enterprise.dto';
import { CustomRequest } from 'src/auth/interfaces/custon_request';

@ApiTags('Enterprise')
@Controller('enterprises')
export class EnterpriseController {
  constructor(
    private readonly enterpriseService: EnterpriseService,
    private readonly filesService: FilesService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get enterprises by pages' })
  @ApiOkResponse({
    description: 'The list of enterprises and the total number of enterprises',
    type: EnterprisePageDto,
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
    description: 'The number of enterprises per page',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findByPage(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.enterpriseService.findAndCountAll(page, limit);

    return {
      enterprises: result.enterprises.map((enterprise) =>
        EnterpriseAdapter.entityToDto(enterprise),
      ),
      total: result.total,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Get an enterprise by uuid',
  })
  @ApiOkResponse({
    description: 'The enterprise',
    type: EnterprisePageDto,
  })
  @ApiNotFoundResponse({
    description: 'Enterprise not found',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async findOne(@Query('uuid') uuid: string) {
    const enterprise = await this.enterpriseService.findByUuid(uuid);

    if (!enterprise) {
      throw new NotFoundException('Enterprise not found');
    }

    return EnterpriseAdapter.entityToDto(enterprise);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a enterprise partially',
    description:
      'Update some enterprise data partially. At least one field must be sent.',
  })
  @ApiOkResponse({
    description: 'The enterprise was updated successfully',
    type: EnterprisePageDto,
  })
  @ApiNotFoundResponse({
    description: 'The enterprise was not found',
  })
  @HttpCode(HttpStatus.OK)
  @Patch()
  async partialUpdate(
    @Body() partialStudentDto: PartialEnterpriseDto,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user.id;

    const enterprise = await this.enterpriseService.updateByUserId(
      userId,
      partialStudentDto,
    );

    return EnterpriseAdapter.entityToDto(enterprise);
  }
}
