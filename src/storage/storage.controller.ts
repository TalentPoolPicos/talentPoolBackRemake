import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Get,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import {
  UploadFileDto,
  UploadResponseDto,
  MinioConfigDto,
} from './dtos/upload.dto';
import { CustomRequest } from '../auth/interfaces/custon_request';

@ApiTags('Storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @ApiOperation({
    summary: 'Upload de arquivo',
    description:
      'Faz upload de um arquivo para o MinIO e retorna informações para salvar no attachment',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Arquivo enviado com sucesso',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido ou tipo não permitido',
    schema: {
      example: {
        statusCode: 400,
        message: 'Arquivo muito grande. Tamanho máximo para curriculum: 20 MB',
        error: 'Bad Request',
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req: CustomRequest,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const result = await this.storageService.uploadFile(
      file,
      uploadDto.type,
      req.user.sub,
    );

    return result;
  }

  @ApiOperation({
    summary: 'Gerar URL temporária',
    description: 'Gera uma URL temporária para acesso a um arquivo',
  })
  @ApiParam({
    name: 'storageKey',
    description: 'Chave de storage do arquivo (URL encoded)',
    example:
      'curriculum%2F2024%2F09%2Fuser_1%2Fcurriculum_1694567890123_a1b2c3d4.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'URL gerada com sucesso',
    schema: {
      example: {
        url: 'https://minio.exemplo.com/bucket/curriculum/2024/09/user_1/curriculum_1694567890123_a1b2c3d4.pdf?expires=3600',
        expiresIn: 3600,
      },
    },
  })
  @Get('url/:storageKey')
  async generateFileUrl(
    @Param('storageKey') storageKey: string,
  ): Promise<{ url: string; expiresIn: number }> {
    const decodedKey = decodeURIComponent(storageKey);
    const url = await this.storageService.generateFileUrl(decodedKey);

    return {
      url,
      expiresIn: 3600, // 1 hora
    };
  }

  @ApiOperation({
    summary: 'Remover arquivo',
    description: 'Remove um arquivo do storage',
  })
  @ApiParam({
    name: 'storageKey',
    description: 'Chave de storage do arquivo (URL encoded)',
    example:
      'curriculum%2F2024%2F09%2Fuser_1%2Fcurriculum_1694567890123_a1b2c3d4.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo removido com sucesso',
    schema: {
      example: {
        message: 'Arquivo removido com sucesso',
      },
    },
  })
  @Delete(':storageKey')
  async deleteFile(
    @Param('storageKey') storageKey: string,
  ): Promise<{ message: string }> {
    const decodedKey = decodeURIComponent(storageKey);
    await this.storageService.deleteFile(decodedKey);

    return {
      message: 'Arquivo removido com sucesso',
    };
  }

  @ApiOperation({
    summary: 'Configuração do MinIO',
    description: 'Retorna informações de configuração do MinIO (para debug)',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuração obtida com sucesso',
    type: MinioConfigDto,
  })
  @Get('config')
  getConfig(): MinioConfigDto {
    return this.storageService.getConfig() as MinioConfigDto;
  }
}
