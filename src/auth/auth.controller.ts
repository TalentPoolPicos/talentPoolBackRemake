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
} from '@nestjs/swagger';
import { AccessTokenDto } from './dtos/acess.dto';
import { SignUpDto } from './dtos/signup.dto';
import { RefreshTokenDto } from './dtos/refresh.dto';
import { Role } from 'src/common/enums/roles.enum';
import { Public } from './decotaros/public.decorator';

@ApiTags('Auth', 'V1')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiTags('Student')
  @ApiOperation({
    summary: 'Sign in as a student',
    description: 'Sign a new user as student.',
  })
  @ApiOkResponse({
    description: 'The student has successfully signed in',
    type: AccessTokenDto,
  })
  @ApiNotFoundResponse({ description: 'The student could not be found' })
  @ApiUnauthorizedResponse({
    description: 'The student could not be authenticated',
  })
  @HttpCode(HttpStatus.OK)
  @Post('student/sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Public()
  @ApiTags('Student')
  @ApiOperation({
    summary: 'Sign up as a student',
    description: 'Create and sign up a new user as student.',
  })
  @ApiOkResponse({
    description: 'The student has successfully signed up',
    type: AccessTokenDto,
  })
  @ApiNotFoundResponse({ description: 'The student could not be found' })
  @ApiUnauthorizedResponse({
    description: 'The student could not be authenticated',
  })
  @ApiConflictResponse({
    description:
      '"The student already exists" or "The email is already in use" or "role is not valid"',
    schema: {
      example: {
        statusCode: HttpStatus.CONFLICT,
        message: ['The student already exists', 'The email is already in use'],
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'The model state is invalid',
  })
  @HttpCode(HttpStatus.OK)
  @Post('student/sign-up')
  signUp(@Body() signInDto: SignUpDto) {
    return this.authService.signUp(
      signInDto.username,
      signInDto.email,
      signInDto.password,
      Role.STUDENT,
    );
  }

  @Public()
  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiOkResponse({
    description: 'The access token has been successfully refreshed',

    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({
    description: 'The refresh token is invalid',
  })
  @ApiNotFoundResponse({
    description: 'The user could not be found',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }
}
