import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
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

@ApiTags('Meu Perfil')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

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
        statusCode: 404,
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
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
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
        statusCode: 404,
        message: 'Perfil de estudante não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuário não é um estudante',
    schema: {
      example: {
        statusCode: 403,
        message: 'Apenas estudantes podem atualizar perfil de estudante',
        error: 'Forbidden',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Número de matrícula já está em uso',
    schema: {
      example: {
        statusCode: 409,
        message: 'Número de matrícula já está em uso',
        error: 'Conflict',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
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
        statusCode: 404,
        message: 'Perfil de empresa não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuário não é uma empresa',
    schema: {
      example: {
        statusCode: 403,
        message: 'Apenas empresas podem atualizar perfil de empresa',
        error: 'Forbidden',
      },
    },
  })
  @ApiConflictResponse({
    description: 'CNPJ já está em uso',
    schema: {
      example: {
        statusCode: 409,
        message: 'CNPJ já está em uso',
        error: 'Conflict',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
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
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
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
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
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
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
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
    summary: 'Remover endereço',
    description: 'Remove o endereço do usuário',
  })
  @ApiOkResponse({
    description: 'Endereço removido com sucesso',
    type: UserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Delete('address')
  removeAddress(
    @Request() req: CustomRequest,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.removeAddress(req.user.sub);
  }
}
