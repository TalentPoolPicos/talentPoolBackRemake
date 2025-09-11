import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Public } from '../auth/decotaros/public.decorator';
import { UsersService } from './users.service';
import {
  PublicUserProfileResponseDto,
  UserPreviewResponseDto,
} from './dtos/user-response.dto';

@ApiTags('Users - Public')
@Public() // Tornar todas as rotas deste controller públicas
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Obter preview/resumo do usuário',
    description:
      'Retorna um resumo compacto do perfil público do usuário (informações básicas para listagens)',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Preview do usuário obtido com sucesso',
    type: UserPreviewResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado ou perfil não disponível',
  })
  @Get(':uuid/preview')
  getUserPreview(@Param('uuid') uuid: string): Promise<UserPreviewResponseDto> {
    return this.usersService.getUserPreview(uuid);
  }

  @ApiOperation({
    summary: 'Obter perfil público completo de usuário',
    description:
      'Retorna o perfil público completo de um usuário pelo UUID (dados públicos apenas)',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Perfil público obtido com sucesso',
    type: PublicUserProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado ou perfil não disponível',
  })
  @Get(':uuid')
  getPublicProfile(
    @Param('uuid') uuid: string,
  ): Promise<PublicUserProfileResponseDto> {
    return this.usersService.getPublicProfile(uuid);
  }
}
