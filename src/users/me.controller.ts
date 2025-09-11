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
  Logger,
  HttpException,
  InternalServerErrorException,
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
  ApiInternalServerErrorResponse,
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
import {
  UserProfileResponseDto,
  DeleteProfileResponseDto,
} from './dtos/user-response.dto';
import { LikesService } from '../likes/likes.service';
import {
  HasLikedResponseDto,
  GiveLikeResponseDto,
  RemoveLikeResponseDto,
} from '../likes/dtos/like.dto';
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
  private readonly logger = new Logger(MeController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userImageService: UserImageService,
    private readonly likesService: LikesService,
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
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
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
  })
  @ApiForbiddenResponse({
    description: 'Usuário não é um estudante',
  })
  @ApiConflictResponse({
    description: 'Número de matrícula já está em uso',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
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
  })
  @ApiForbiddenResponse({
    description: 'Usuário não é uma empresa',
  })
  @ApiConflictResponse({
    description: 'CNPJ já está em uso',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
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
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
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
  })
  @ApiBadRequestResponse({
    description: 'UUID inválido',
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
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
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
  })
  @ApiBadRequestResponse({
    description: 'UUID inválido',
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
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
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
  })
  @ApiNotFoundResponse({
    description: 'Estudante não encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor durante o upload',
  })
  @Post('student/curriculum')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCurriculum(
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadCurriculumResponseDto> {
    try {
      return await this.userImageService.uploadCurriculum(file, req.user.sub);
    } catch (error) {
      // Log do erro para debugging
      this.logger.error(
        `Erro no upload de currículo para usuário ${req.user.sub}:`,
        error,
      );

      // Se já é uma HttpException, re-throw para manter o status code correto
      if (error instanceof HttpException) {
        throw error;
      }

      // Para outros erros, throw InternalServerErrorException
      throw new InternalServerErrorException(
        'Erro interno no servidor durante o upload do currículo',
      );
    }
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
  })
  @ApiNotFoundResponse({
    description: 'Estudante não encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor durante o upload',
  })
  @Post('student/history')
  @UseInterceptors(FileInterceptor('file'))
  async uploadHistory(
    @Request() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadHistoryResponseDto> {
    try {
      return await this.userImageService.uploadHistory(file, req.user.sub);
    } catch (error) {
      // Log do erro para debugging
      this.logger.error(
        `Erro no upload de histórico para usuário ${req.user.sub}:`,
        error,
      );

      // Se já é uma HttpException, re-throw para manter o status code correto
      if (error instanceof HttpException) {
        throw error;
      }

      // Para outros erros, throw InternalServerErrorException
      throw new InternalServerErrorException(
        'Erro interno no servidor durante o upload do histórico',
      );
    }
  }

  @ApiOperation({
    summary: 'Verificar se deu like em um usuário',
    description:
      'Verifica se o usuário logado deu like em outro usuário especificado pelo UUID.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID do usuário para verificar o like',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Status do like verificado com sucesso',
    type: HasLikedResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno no servidor',
  })
  @Get('likes/:uuid/check')
  async checkLike(
    @Request() req: CustomRequest,
    @Param('uuid') uuid: string,
  ): Promise<HasLikedResponseDto> {
    try {
      const hasLiked = await this.likesService.hasLiked(req.user.sub, uuid);

      return {
        hasLiked,
        targetUserUuid: uuid,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao verificar like do usuário ${req.user.sub} para ${uuid}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro interno no servidor ao verificar like',
      );
    }
  }

  @ApiOperation({
    summary: 'Dar like em um usuário',
    description:
      'Permite ao usuário logado dar like em outro usuário. Não é possível dar like em usuários da mesma categoria (role).',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID do usuário para dar like',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiCreatedResponse({
    description: 'Like dado com sucesso',
    type: GiveLikeResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Não é possível dar like em si mesmo ou usuários da mesma categoria',
  })
  @ApiConflictResponse({
    description: 'Like já foi dado para este usuário',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno no servidor',
  })
  @Post('likes/:uuid')
  @HttpCode(HttpStatus.CREATED)
  async giveLike(
    @Request() req: CustomRequest,
    @Param('uuid') uuid: string,
  ): Promise<GiveLikeResponseDto> {
    try {
      await this.likesService.giveLike(req.user.sub, uuid);

      return {
        message: 'Like dado com sucesso',
        targetUserUuid: uuid,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao dar like do usuário ${req.user.sub} para ${uuid}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro interno no servidor ao dar like',
      );
    }
  }

  @ApiOperation({
    summary: 'Remover like de um usuário',
    description:
      'Permite ao usuário logado remover o like dado em outro usuário.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID do usuário para remover like',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Like removido com sucesso',
    type: RemoveLikeResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou like não encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno no servidor',
  })
  @Delete('likes/:uuid')
  async removeLike(
    @Request() req: CustomRequest,
    @Param('uuid') uuid: string,
  ): Promise<RemoveLikeResponseDto> {
    try {
      await this.likesService.removeLike(req.user.sub, uuid);

      return {
        message: 'Like removido com sucesso',
        targetUserUuid: uuid,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao remover like do usuário ${req.user.sub} para ${uuid}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro interno no servidor ao remover like',
      );
    }
  }

  @ApiOperation({
    summary: 'Deletar meu perfil',
    description:
      'Deleta permanentemente o perfil do usuário autenticado. Esta ação não pode ser desfeita.',
  })
  @ApiOkResponse({
    description: 'Perfil deletado com sucesso',
    type: DeleteProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiConflictResponse({
    description: 'Usuário já foi deletado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
  })
  @HttpCode(HttpStatus.OK)
  @Delete()
  deleteMyProfile(
    @Request() req: CustomRequest,
  ): Promise<DeleteProfileResponseDto> {
    return this.usersService.deleteMyProfile(req.user.sub);
  }
}
