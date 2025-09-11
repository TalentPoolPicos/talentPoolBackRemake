import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signin.dto';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AccessTokenDto } from './dtos/acess.dto';
import { SignUpDto } from './dtos/signup.dto';
import { RefreshTokenDto } from './dtos/refresh.dto';
import { Public } from './decotaros/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Fazer login',
    description:
      'Autenticar usuário com nome de usuário e senha. Após autenticação, use a rota GET /me para obter dados do perfil.',
  })
  @ApiOkResponse({
    description:
      'Usuário logado com sucesso. Use o access_token para acessar rotas protegidas e obter dados via GET /me.',
    type: AccessTokenDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas ou conta inativa',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto): Promise<AccessTokenDto> {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Public()
  @ApiOperation({
    summary: 'Cadastro de estudante',
    description:
      'Criar uma nova conta de estudante com email institucional (ex: @ufpi.edu.br). Após cadastro, use a rota GET /me para obter e completar dados do perfil.',
  })
  @ApiOkResponse({
    description:
      'Usuário criado e logado com sucesso. Use o access_token para acessar rotas protegidas e gerenciar perfil via GET/PUT /me.',
    type: AccessTokenDto,
  })
  @ApiConflictResponse({
    description: 'Nome de usuário ou email já existe',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Falha ao criar usuário',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto): Promise<AccessTokenDto> {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Renovar token de acesso',
    description:
      'Obter um novo token de acesso usando um token de renovação válido. Para obter dados atualizados do usuário, use a rota GET /me.',
  })
  @ApiOkResponse({
    description:
      'Token de acesso renovado com sucesso. Use o novo access_token para acessar rotas protegidas.',
    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de renovação inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Usuário associado ao token não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AccessTokenDto> {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }
}
