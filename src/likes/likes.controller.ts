import {
  Controller,
  Get,
  Param,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { Public } from '../auth/decotaros/public.decorator';
import {
  LikeInitiatorsResponseDto,
  LikeReceiversResponseDto,
} from './dtos/like.dto';

@ApiTags('Likes - Public')
@Controller('likes')
@Public()
export class LikesController {
  private readonly logger = new Logger(LikesController.name);

  constructor(private readonly likesService: LikesService) {}

  @ApiOperation({
    summary: 'Listar quem deu like para o usuário',
    description:
      'Obtém a lista de usuários que deram like para o usuário especificado pelo UUID. Esta é uma rota pública.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Lista de usuários que deram like',
    type: LikeInitiatorsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno no servidor',
  })
  @Get(':uuid/initiators')
  async getLikeInitiators(
    @Param('uuid') uuid: string,
  ): Promise<LikeInitiatorsResponseDto> {
    this.logger.log(`Buscando quem deu like no usuário: ${uuid}`);

    try {
      const initiators = await this.likesService.getLikeInitiators(uuid);

      return {
        initiators,
        total: initiators.length,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar quem deu like no usuário ${uuid}:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao buscar dados do usuário');
    }
  }

  @ApiOperation({
    summary: 'Listar para quem o usuário deu like',
    description:
      'Obtém a lista de usuários que receberam like do usuário especificado pelo UUID. Esta é uma rota pública.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Lista de usuários que receberam like',
    type: LikeReceiversResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno no servidor',
  })
  @Get(':uuid/receivers')
  async getLikeReceivers(
    @Param('uuid') uuid: string,
  ): Promise<LikeReceiversResponseDto> {
    this.logger.log(`Buscando para quem o usuário ${uuid} deu like`);

    try {
      const receivers = await this.likesService.getLikeReceivers(uuid);

      return {
        receivers,
        total: receivers.length,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar para quem o usuário ${uuid} deu like:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao buscar dados do usuário');
    }
  }
}
