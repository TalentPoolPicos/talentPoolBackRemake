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

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Fazer login',
    description: 'Autenticar usuário com nome de usuário e senha',
  })
  @ApiOkResponse({
    description: 'Usuário logado com sucesso',
    type: AccessTokenDto,
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
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas ou conta inativa',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciais inválidas',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['Nome de usuário deve ter pelo menos 3 caracteres'],
        error: 'Bad Request',
      },
    },
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
      'Criar uma nova conta de estudante com email institucional (ex: @ufpi.edu.br)',
  })
  @ApiOkResponse({
    description: 'Usuário criado e logado com sucesso',
    type: AccessTokenDto,
  })
  @ApiConflictResponse({
    description: 'Nome de usuário ou email já existe',
    schema: {
      example: {
        statusCode: 409,
        message: 'Nome de usuário já existe',
        error: 'Conflict',
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Falha ao criar usuário',
    schema: {
      example: {
        statusCode: 422,
        message: 'Falha ao criar usuário',
        error: 'Unprocessable Entity',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Nome de usuário deve ter pelo menos 3 caracteres',
          'Email deve ser um endereço de email válido',
          'Email deve ser de um domínio institucional. Domínios válidos: @ufpi.edu.br, @ufpi.br, @ufc.br, @ifpi.edu.br, etc.',
          'Senha deve ter pelo menos 8 caracteres e conter pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo',
        ],
        error: 'Bad Request',
      },
    },
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
      'Obter um novo token de acesso usando um token de renovação válido',
  })
  @ApiOkResponse({
    description: 'Token de acesso renovado com sucesso',
    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de renovação inválido ou expirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token de renovação inválido',
        error: 'Unauthorized',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuário associado ao token não encontrado',
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
        message: ['Token de renovação não pode estar vazio'],
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AccessTokenDto> {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }
}
