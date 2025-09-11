import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PublicUserProfileResponseDto } from './dtos/user-response.dto';

@ApiTags('Usuários Públicos')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Obter perfil público de usuário',
    description:
      'Retorna o perfil público de um usuário pelo UUID (dados públicos apenas)',
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
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @Get(':uuid')
  getPublicProfile(
    @Param('uuid') uuid: string,
  ): Promise<PublicUserProfileResponseDto> {
    return this.usersService.getPublicProfile(uuid);
  }
}
