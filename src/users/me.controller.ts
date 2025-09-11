import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserImageService } from './user-image.service';
import { CustomRequest } from '../auth/interfaces/custon_request';
import {
  UpdateProfileDto,
  UpdateStudentProfileDto,
  UpdateEnterpriseProfileDto,
  UpdateSocialMediaDto,
  UpdateTagsDto,
  UpdateAddressDto,
} from './dtos/update-profile.dto';
import { UserProfileResponseDto } from './dtos/user-response.dto';
import {
  UploadAvatarResponseDto,
  UploadBannerResponseDto,
  UploadCurriculumResponseDto,
  UploadHistoryResponseDto,
} from './dtos/upload-image.dto';

@ApiTags('Meu Perfil')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userImageService: UserImageService,
  ) {}

  @ApiOperation({
    summary: 'Obter meu perfil completo',
    description:
      'Retorna o perfil completo do usuário autenticado com todos os dados privados e estatísticas',
  })
  @ApiOkResponse({
    description: 'Perfil do usuário obtido com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @Get()
  getMyProfile(@Request() req: CustomRequest): Promise<UserProfileResponseDto> {
    return this.usersService.getMyProfile(req.user.sub);
  }

  @ApiOperation({
    summary: 'Atualizar perfil básico',
    description:
      'Atualiza informações básicas do perfil (nome, descrição, data de nascimento)',
  })
  @ApiOkResponse({
    description: 'Perfil atualizado com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Nome deve ter pelo menos 2 caracteres'],
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put()
  updateProfile(
    @Request() req: CustomRequest,
    @Body() updateData: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(req.user.sub, updateData);
  }

  @ApiOperation({
    summary: 'Atualizar perfil de estudante',
    description:
      'Atualiza informações específicas do perfil de estudante (curso, matrícula, lattes)',
  })
  @ApiOkResponse({
    description: 'Perfil de estudante atualizado com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou perfil de estudante não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Perfil de estudante não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuário não é um estudante',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Apenas estudantes podem atualizar perfil de estudante',
        error: 'Forbidden',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Número de matrícula já está em uso',
    schema: {
      example: {
        statusCode: HttpStatus.CONFLICT,
        message: 'Número de matrícula já está em uso',
        error: 'Conflict',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Curso deve ter no máximo 100 caracteres'],
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put('student')
  updateStudentProfile(
    @Request() req: CustomRequest,
    @Body() updateData: UpdateStudentProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateStudentProfile(req.user.sub, updateData);
  }

  @ApiOperation({
    summary: 'Atualizar perfil de empresa',
    description:
      'Atualiza informações específicas do perfil de empresa (nome fantasia, CNPJ, razão social)',
  })
  @ApiOkResponse({
    description: 'Perfil de empresa atualizado com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou perfil de empresa não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Perfil de empresa não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuário não é uma empresa',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Apenas empresas podem atualizar perfil de empresa',
        error: 'Forbidden',
      },
    },
  })
  @ApiConflictResponse({
    description: 'CNPJ já está em uso',
    schema: {
      example: {
        statusCode: HttpStatus.CONFLICT,
        message: 'CNPJ já está em uso',
        error: 'Conflict',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['CNPJ deve ter no máximo 18 caracteres'],
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put('enterprise')
  updateEnterpriseProfile(
    @Request() req: CustomRequest,
    @Body() updateData: UpdateEnterpriseProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateEnterpriseProfile(req.user.sub, updateData);
  }

  @ApiOperation({
    summary: 'Atualizar redes sociais',
    description: 'Atualiza a lista de redes sociais do usuário',
  })
  @ApiOkResponse({
    description: 'Redes sociais atualizadas com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['URL deve ser válida'],
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put('social-media')
  updateSocialMedia(
    @Request() req: CustomRequest,
    @Body() updateData: UpdateSocialMediaDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateSocialMedia(req.user.sub, updateData);
  }

  @ApiOperation({
    summary: 'Deletar rede social',
    description: 'Remove uma rede social específica do perfil do usuário',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID da rede social a ser removida',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Rede social removida com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou rede social não encontrada',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Rede social não encontrada',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'UUID inválido',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'UUID inválido',
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Delete('social-media/:uuid')
  deleteSocialMedia(
    @Request() req: CustomRequest,
    @Param('uuid') uuid: string,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.deleteSocialMedia(req.user.sub, uuid);
  }

  @ApiOperation({
    summary: 'Atualizar tags',
    description: 'Atualiza a lista de tags/habilidades do usuário',
  })
  @ApiOkResponse({
    description: 'Tags atualizadas com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['Label da tag deve ter no máximo 40 caracteres'],
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put('tags')
  updateTags(
    @Request() req: CustomRequest,
    @Body() updateData: UpdateTagsDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateTags(req.user.sub, updateData);
  }

  @ApiOperation({
    summary: 'Deletar tag',
    description: 'Remove uma tag específica do perfil do usuário',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID da tag a ser removida',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Tag removida com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou tag não encontrada',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Tag não encontrada',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'UUID inválido',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'UUID inválido',
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Delete('tags/:uuid')
  deleteTag(
    @Request() req: CustomRequest,
    @Param('uuid') uuid: string,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.deleteTag(req.user.sub, uuid);
  }

  @ApiOperation({
    summary: 'Atualizar endereço',
    description: 'Atualiza ou cria o endereço do usuário',
  })
  @ApiOkResponse({
    description: 'Endereço atualizado com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['CEP deve ser uma string'],
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Put('address')
  updateAddress(
    @Request() req: CustomRequest,
    @Body() updateData: UpdateAddressDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateAddress(req.user.sub, updateData);
  }

  @ApiOperation({
    summary: 'Upload de avatar',
    description:
      'Faz upload do avatar do usuário. Aceita apenas imagens em formato JPEG, PNG ou WebP com dimensões aproximadamente quadradas (150x150 a 1000x1000px).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload de arquivo de avatar',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem para avatar (JPEG, PNG, WebP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Avatar carregado com sucesso',
    type: UploadAvatarResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Arquivo inválido ou não atende aos requisitos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Dimensões inválidas. Requerido: 150x150 a 1000x1000px',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadAvatarResponseDto> {
    return this.userImageService.uploadAvatar(req.user.sub, file);
  }

  @ApiOperation({
    summary: 'Upload de banner',
    description:
      'Faz upload do banner do usuário. Aceita apenas imagens em formato JPEG, PNG ou WebP com formato retangular horizontal (800x300 a 1920x1080px).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload de arquivo de banner',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem para banner (JPEG, PNG, WebP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Banner carregado com sucesso',
    type: UploadBannerResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Arquivo inválido ou não atende aos requisitos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          'Proporção inválida. Banner deve ter formato retangular horizontal',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @Post('banner')
  @UseInterceptors(FileInterceptor('file'))
  uploadBanner(
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadBannerResponseDto> {
    return this.userImageService.uploadBanner(req.user.sub, file);
  }

  @ApiOperation({
    summary: 'Upload de currículo do estudante',
    description:
      'Faz upload do currículo em PDF para o perfil do estudante. Substitui o currículo anterior se existir.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo PDF do currículo',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF do currículo (máximo 15MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Currículo enviado com sucesso',
    type: UploadCurriculumResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Arquivo inválido ou não atende aos requisitos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Formato não permitido. Formatos aceitos: .pdf',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Estudante não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Estudante não encontrado',
        error: 'Not Found',
      },
    },
  })
  @Post('student/curriculum')
  @UseInterceptors(FileInterceptor('file'))
  uploadCurriculum(
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadCurriculumResponseDto> {
    return this.userImageService.uploadCurriculum(file, req.user.sub);
  }

  @ApiOperation({
    summary: 'Upload de histórico escolar do estudante',
    description:
      'Faz upload do histórico escolar em PDF para o perfil do estudante. Substitui o histórico anterior se existir.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo PDF do histórico escolar',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF do histórico escolar (máximo 15MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Histórico enviado com sucesso',
    type: UploadHistoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Arquivo inválido ou não atende aos requisitos',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Formato não permitido. Formatos aceitos: .pdf',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Estudante não encontrado',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Estudante não encontrado',
        error: 'Not Found',
      },
    },
  })
  @Post('student/history')
  @UseInterceptors(FileInterceptor('file'))
  uploadHistory(
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadHistoryResponseDto> {
    return this.userImageService.uploadHistory(file, req.user.sub);
  }
}
