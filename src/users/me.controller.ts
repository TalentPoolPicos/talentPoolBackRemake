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
  Query,
  ValidationPipe,
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
  ApiQuery,
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
  AddTagDto,
  CreateAddressDto,
  UpdateAddressDirectDto,
} from './dtos/update-profile.dto';
import {
  UserProfileResponseDto,
  DeleteProfileResponseDto,
} from './dtos/user-response.dto';
import {
  GetRecommendedUsersDto,
  RecommendedUsersResponseDto,
} from './dtos/recommendations.dto';
import { LikesService } from '../likes/likes.service';
import { JobsService } from '../jobs/jobs.service';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decotaros/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import {
  CreateJobDto,
  UpdateJobContentDto,
  ApplyToJobDto,
  UpdateApplicationStatusDto,
  AddApplicationNotesDto,
  GetApplicationsFilterDto,
  StudentApplicationsPaginationDto,
  EnterpriseJobsPaginationDto,
} from '../jobs/dtos/job.dto';
import {
  JobResponseDto,
  JobApplicationResponseDto,
  JobListResponseDto,
  ApplicationListResponseDto,
  StudentApplicationListResponseDto,
  JobApplicationStudentResponseDto,
} from '../jobs/dtos/job-response.dto';
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
import { NotificationManagerService } from '../notifications/notification-manager.service';

@ApiTags('Me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  private readonly logger = new Logger(MeController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userImageService: UserImageService,
    private readonly likesService: LikesService,
    private readonly jobsService: JobsService,
    private readonly notificationManager: NotificationManagerService,
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

  @ApiTags('Students')
  @ApiOperation({
    summary: 'Atualizar perfil de estudante',
    description:
      'Atualiza informações específicas do perfil de estudante (matrícula, curso, semestre)',
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

  @ApiTags('Enterprises')
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

  @ApiTags('Social Media')
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

  @ApiTags('Social Media')
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

  @ApiTags('Tags')
  @ApiOperation({
    summary: 'Adicionar tag',
    description: 'Adiciona uma nova tag/habilidade ao perfil do usuário',
  })
  @ApiOkResponse({
    description: 'Tag adicionada com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @HttpCode(HttpStatus.OK)
  @Post('tags')
  addTag(
    @Request() req: CustomRequest,
    @Body() addTagData: AddTagDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.addTag(req.user.sub, addTagData);
  }

  @ApiTags('Tags')
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

  @ApiTags('Addresses')
  @ApiOperation({
    summary: 'Criar endereço',
    description: 'Cria um novo endereço para o usuário (CEP obrigatório)',
  })
  @ApiOkResponse({
    description: 'Endereço criado com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos ou CEP não fornecido',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('address')
  createAddress(
    @Request() req: CustomRequest,
    @Body() createData: CreateAddressDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.createAddress(req.user.sub, createData);
  }

  @ApiTags('Addresses')
  @ApiOperation({
    summary: 'Atualizar endereço',
    description: 'Atualiza o endereço do usuário (todos os campos opcionais)',
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
  updateAddressDirect(
    @Request() req: CustomRequest,
    @Body() updateData: UpdateAddressDirectDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateAddressDirect(req.user.sub, updateData);
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

  @ApiTags('Students')
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

  @ApiTags('Students')
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

  @ApiTags('Likes')
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

  @ApiTags('Likes')
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

  @ApiTags('Likes')
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

  /**
   * Criar nova vaga (apenas empresas)
   */
  @ApiTags('Enterprises')
  @Post('enterprise/jobs')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({ summary: 'Criar nova vaga' })
  @ApiCreatedResponse({
    description: 'Vaga criada com sucesso',
    type: JobResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Apenas empresas podem criar vagas',
  })
  async createJob(
    @Body() createJobDto: CreateJobDto,
    @Request() req: CustomRequest,
  ): Promise<JobResponseDto> {
    return this.jobsService.createJob(req.user.sub, createJobDto);
  }

  /**
   * Listar minhas vagas (apenas empresas)
   */
  @ApiTags('Enterprises')
  @Get('enterprise/jobs')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({ summary: 'Listar minhas vagas' })
  @ApiOkResponse({
    description: 'Lista de vagas da empresa',
    type: JobListResponseDto,
  })
  async getMyJobs(
    @Request() req: CustomRequest,
    @Query() pagination: EnterpriseJobsPaginationDto,
  ): Promise<JobListResponseDto> {
    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    return this.jobsService.listJobs(
      req.user.sub,
      pagination.status,
      req.user.sub,
      limit,
      offset,
    );
  }

  /**
   * Atualizar conteúdo da vaga (título, body, expiresAt) - apenas empresas
   */
  @ApiTags('Enterprises')
  @Put('enterprise/jobs/:uuid/content')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({
    summary: 'Atualizar conteúdo da vaga',
    description:
      'Atualiza apenas o título, conteúdo e data de expiração da vaga. Disponível apenas para vagas em rascunho (draft).',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da vaga' })
  @ApiOkResponse({
    description: 'Conteúdo da vaga atualizado com sucesso',
    type: JobResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vaga não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para atualizar esta vaga',
  })
  @ApiBadRequestResponse({
    description:
      'Apenas vagas em rascunho (draft) podem ter seu conteúdo editado',
  })
  async updateJobContent(
    @Param('uuid') uuid: string,
    @Body() updateJobContentDto: UpdateJobContentDto,
    @Request() req: CustomRequest,
  ): Promise<JobResponseDto> {
    return this.jobsService.updateJobContent(
      uuid,
      req.user.sub,
      updateJobContentDto,
    );
  }

  /**
   * Publicar vaga (apenas empresas)
   */
  @ApiTags('Enterprises')
  @Put('enterprise/jobs/:uuid/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publicar vaga',
    description: 'Muda o status da vaga para "published" e define publishedAt',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da vaga' })
  @ApiOkResponse({
    description: 'Vaga publicada com sucesso',
    type: JobResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vaga não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para publicar esta vaga',
  })
  async publishJob(
    @Param('uuid') uuid: string,
    @Request() req: CustomRequest,
  ): Promise<JobResponseDto> {
    return this.jobsService.publishJob(uuid, req.user.sub);
  }

  /**
   * Pausar vaga (apenas empresas)
   */
  @ApiTags('Enterprises')
  @Put('enterprise/jobs/:uuid/pause')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pausar vaga',
    description: 'Muda o status da vaga para "draft" (rascunho/pausada)',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da vaga' })
  @ApiOkResponse({
    description: 'Vaga pausada com sucesso',
    type: JobResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vaga não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para pausar esta vaga',
  })
  async pauseJob(
    @Param('uuid') uuid: string,
    @Request() req: CustomRequest,
  ): Promise<JobResponseDto> {
    return this.jobsService.pauseJob(uuid, req.user.sub);
  }

  /**
   * Finalizar vaga (apenas empresas)
   */
  @ApiTags('Enterprises')
  @Put('enterprise/jobs/:uuid/close')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finalizar vaga',
    description: 'Muda o status da vaga para "closed" (finalizada)',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da vaga' })
  @ApiOkResponse({
    description: 'Vaga finalizada com sucesso',
    type: JobResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vaga não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para finalizar esta vaga',
  })
  async closeJob(
    @Param('uuid') uuid: string,
    @Request() req: CustomRequest,
  ): Promise<JobResponseDto> {
    return this.jobsService.closeJob(uuid, req.user.sub);
  }

  /**
   * Atualizar status de candidatura (apenas empresas)
   */
  @ApiTags('Enterprises')
  @Put('enterprise/job-applications/:uuid/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({ summary: 'Atualizar status de candidatura' })
  @ApiParam({
    name: 'uuid',
    type: String,
    description: 'UUID da candidatura',
  })
  @ApiOkResponse({
    description: 'Status da candidatura atualizado com sucesso',
    type: JobApplicationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Candidatura não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para atualizar esta candidatura',
  })
  async updateApplicationStatus(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @Request() req: CustomRequest,
  ): Promise<JobApplicationResponseDto> {
    return this.jobsService.updateApplicationStatus(
      uuid,
      req.user.sub,
      updateDto,
    );
  }

  /**
   * Adicionar notas do recrutador sem alterar status
   */
  @ApiTags('Enterprises')
  @Put('enterprise/applications/:uuid/notes')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({ summary: 'Adicionar notas do recrutador' })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da candidatura' })
  @ApiOkResponse({
    description: 'Notas adicionadas com sucesso',
    type: JobApplicationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Candidatura não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para atualizar esta candidatura',
  })
  async addApplicationNotes(
    @Param('uuid') uuid: string,
    @Body() notesDto: AddApplicationNotesDto,
    @Request() req: CustomRequest,
  ): Promise<JobApplicationResponseDto> {
    return this.jobsService.addApplicationNotes(uuid, req.user.sub, notesDto);
  }

  /**
   * Listar candidaturas de uma vaga (apenas empresas)
   */
  @ApiTags('Enterprises')
  @Get('enterprise/jobs/:uuid/applications')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({ summary: 'Listar candidaturas de uma vaga' })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da vaga' })
  @ApiOkResponse({
    description: 'Lista de candidaturas da vaga',
    type: ApplicationListResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vaga não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para ver as candidaturas desta vaga',
  })
  async getJobApplications(
    @Param('uuid') uuid: string,
    @Request() req: CustomRequest,
  ): Promise<ApplicationListResponseDto> {
    return this.jobsService.getJobApplications(uuid, req.user.sub);
  }

  /**
   * Listar todas as candidaturas da empresa
   */
  @ApiTags('Enterprises')
  @Get('enterprise/applications')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({ summary: 'Listar todas as candidaturas da empresa' })
  @ApiOkResponse({
    description: 'Lista de candidaturas da empresa',
    type: ApplicationListResponseDto,
  })
  async getAllCompanyApplications(
    @Request() req: CustomRequest,
    @Query() filters: GetApplicationsFilterDto,
  ): Promise<ApplicationListResponseDto> {
    return this.jobsService.getAllCompanyApplications(req.user.sub, filters);
  }

  /**
   * Listar candidaturas filtradas de uma vaga específica
   */
  @ApiTags('Enterprises')
  @Get('enterprise/jobs/:uuid/applications/filtered')
  @UseGuards(RolesGuard)
  @Roles(Role.ENTERPRISE)
  @ApiOperation({
    summary: 'Listar candidaturas filtradas de uma vaga específica',
    description: 'Permite filtrar candidaturas por status e paginação',
  })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID da vaga' })
  @ApiOkResponse({
    description: 'Lista filtrada de candidaturas da vaga',
    type: ApplicationListResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vaga não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para ver as candidaturas desta vaga',
  })
  async getJobApplicationsFiltered(
    @Param('uuid') uuid: string,
    @Query() filters: GetApplicationsFilterDto,
    @Request() req: CustomRequest,
  ): Promise<ApplicationListResponseDto> {
    return this.jobsService.getJobApplicationsFiltered(
      uuid,
      req.user.sub,
      filters,
    );
  }

  /**
   * Aplicar para vaga (apenas estudantes)
   */
  @ApiTags('Students')
  @Post('student/job-applications/:jobUuid')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Aplicar para vaga' })
  @ApiParam({ name: 'jobUuid', type: String, description: 'UUID da vaga' })
  @ApiCreatedResponse({
    description: 'Candidatura criada com sucesso',
    type: JobApplicationStudentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Vaga não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Apenas estudantes podem se candidatar a vagas',
  })
  @ApiConflictResponse({
    description: 'Você já se candidatou a esta vaga',
  })
  @ApiBadRequestResponse({
    description: 'Esta vaga não está disponível ou expirou',
  })
  async applyToJob(
    @Param('jobUuid') jobUuid: string,
    @Body() applyDto: ApplyToJobDto,
    @Request() req: CustomRequest,
  ): Promise<JobApplicationStudentResponseDto> {
    return this.jobsService.applyToJob(jobUuid, req.user.sub, applyDto);
  }

  /**
   * Listar minhas candidaturas (apenas estudantes)
   */
  @ApiTags('Students')
  @Get('student/job-applications')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Listar minhas candidaturas' })
  @ApiOkResponse({
    description: 'Lista de candidaturas do estudante',
    type: StudentApplicationListResponseDto,
  })
  async getMyApplications(
    @Request() req: CustomRequest,
    @Query() pagination: StudentApplicationsPaginationDto,
  ): Promise<StudentApplicationListResponseDto> {
    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    return this.jobsService.getStudentApplications(
      req.user.sub,
      undefined, // status filter (opcional)
      limit,
      offset,
    );
  }

  /**
   * Remover candidatura (apenas estudantes)
   */
  @ApiTags('Students')
  @Delete('student/job-applications/:uuid')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Remover candidatura' })
  @ApiParam({
    name: 'uuid',
    type: String,
    description: 'UUID da candidatura',
  })
  @ApiOkResponse({
    description: 'Candidatura removida com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Candidatura não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Você só pode remover suas próprias candidaturas',
  })
  async removeApplication(
    @Param('uuid') uuid: string,
    @Request() req: CustomRequest,
  ): Promise<{ message: string }> {
    await this.jobsService.removeStudentApplication(uuid, req.user.sub);
    return { message: 'Candidatura removida com sucesso' };
  }

  // ================================
  // ROTAS DE NOTIFICAÇÕES
  // ================================
  @ApiTags('Notifications')
  @ApiOperation({
    summary: 'Obter minhas notificações',
    description: `
Retorna as notificações do usuário autenticado com paginação e filtros.

**💡 Dica:** Para receber notificações em tempo real, conecte-se também ao WebSocket:
\`\`\`javascript
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'your-jwt-token' }
});
socket.on('notification', (notification) => {
  console.log('Nova notificação:', notification);
});
\`\`\`

**📡 Fluxo recomendado:**
1. Use esta rota para carregar o histórico
2. Conecte ao WebSocket para receber novas em tempo real
3. Use PUT /notifications/:id/read para marcar como lidas
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de itens por página (padrão: 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'unreadOnly',
    required: false,
    description: 'Filtrar apenas notificações não lidas',
    example: false,
  })
  @ApiOkResponse({
    description: 'Notificações obtidas com sucesso',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'object',
          properties: {
            notifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  title: { type: 'string', example: 'Nova vaga disponível' },
                  message: {
                    type: 'string',
                    example: 'Uma nova vaga foi publicada!',
                  },
                  type: {
                    type: 'string',
                    example: 'job_published',
                  },
                  isRead: { type: 'boolean', example: false },
                  createdAt: {
                    type: 'string',
                    example: '2025-09-12T10:30:00Z',
                  },
                  readAt: {
                    type: 'string',
                    nullable: true,
                    example: null,
                  },
                },
              },
            },
          },
        },
        unreadCount: { type: 'number', example: 5 },
        stats: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            unread: { type: 'number', example: 5 },
            byType: {
              type: 'object',
              example: {
                job_published: 10,
                profile_liked: 8,
                system_announcement: 7,
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 25 },
          },
        },
      },
    },
  })
  @Get('notifications')
  async getMyNotifications(
    @Request() req: CustomRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('unreadOnly') unreadOnly = false,
  ) {
    const notifications = await this.notificationManager.getUserNotifications(
      req.user.sub,
      typeof unreadOnly === 'string' ? unreadOnly === 'true' : unreadOnly,
    );

    const unreadCount = await this.notificationManager.getUnreadCount(
      req.user.sub,
    );
    const stats = await this.notificationManager.getUserNotificationStats(
      req.user.sub,
    );

    return {
      notifications,
      unreadCount,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: notifications.notifications.length,
      },
    };
  }

  @ApiTags('Notifications')
  @ApiOperation({
    summary: 'Marcar notificação como lida',
    description: 'Marca uma notificação específica como lida',
  })
  @ApiOkResponse({
    description: 'Notificação marcada como lida com sucesso',
  })
  @Put('notifications/:id/read')
  async markNotificationAsRead(
    @Param('id') notificationId: string,
    @Request() req: CustomRequest,
  ): Promise<{ message: string; success: boolean }> {
    const success = await this.notificationManager.markAsRead(
      parseInt(notificationId),
      req.user.sub,
    );

    return {
      message: success
        ? 'Notificação marcada como lida com sucesso'
        : 'Notificação não encontrada ou já lida',
      success,
    };
  }

  @ApiTags('Notifications')
  @ApiOperation({
    summary: 'Marcar todas as notificações como lidas',
    description: 'Marca todas as notificações do usuário como lidas',
  })
  @ApiOkResponse({
    description: 'Notificações marcadas como lidas com sucesso',
  })
  @Put('notifications/read-all')
  async markAllNotificationsAsRead(
    @Request() req: CustomRequest,
  ): Promise<{ message: string; count: number }> {
    const count = await this.notificationManager.markAllAsRead(req.user.sub);

    return {
      message: `${count} notificações marcadas como lidas`,
      count,
    };
  }

  @ApiTags('Notifications')
  @ApiOperation({
    summary: 'Obter contagem de notificações não lidas',
    description: 'Retorna apenas a contagem de notificações não lidas',
  })
  @ApiOkResponse({
    description: 'Contagem obtida com sucesso',
  })
  @Get('notifications/unread-count')
  async getUnreadNotificationsCount(
    @Request() req: CustomRequest,
  ): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationManager.getUnreadCount(
      req.user.sub,
    );

    return { unreadCount };
  }

  @ApiTags('Students', 'Enterprises')
  @ApiOperation({
    summary: 'Obter usuários recomendados',
    description:
      'Retorna uma lista paginada de usuários recomendados baseada nas tags do usuário atual. Usuários estudantes recebem recomendações de empresas e vice-versa.',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número de resultados por página (1-50)',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset para paginação (início em 0)',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiOkResponse({
    description: 'Usuários recomendados obtidos com sucesso',
    type: RecommendedUsersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de paginação inválidos',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
  })
  @Get('recommendations')
  async getRecommendedUsers(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: GetRecommendedUsersDto,
    @Request() req: CustomRequest,
  ): Promise<RecommendedUsersResponseDto> {
    const { limit = 20, offset = 0 } = query;

    const result = await this.usersService.getRecommendedUsers(
      req.user.sub,
      limit,
      offset,
    );

    return {
      users: result.users,
      total: result.total,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
      count: result.users.length,
      offset,
      limit,
    };
  }
}
