import {
  Controller,
  Get,
  NotFoundException,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesService } from './file.service';
import { Public } from 'src/auth/decotaros/public.decorator';

@ApiTags('minio')
@Controller('minio')
export class MinioController {
  constructor(private readonly fileService: FilesService) {}

  @Public()
  @ApiOperation({
    summary: 'Get file by UUID',
    description: 'Get file by UUID',
  })
  @Get(':uuid')
  async getFile(@Param('uuid') uuid: string): Promise<StreamableFile> {
    const url = await this.fileService.getMinIOUrl(uuid);

    if (!url) {
      throw new NotFoundException(`File with UUID ${uuid} not found`);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new NotFoundException(`File with UUID ${uuid} not found`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    return new StreamableFile(uint8, {
      type: response.headers.get('content-type') ?? 'application/octet-stream',
      length: uint8.length,
    });
  }
}
