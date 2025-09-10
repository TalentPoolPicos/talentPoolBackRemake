import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtPayload } from './interfaces/payload';
import { RefreshPayload } from './interfaces/refresh';
import { UserWithProfiles } from './interfaces/user.interface';
import { SignUpDto } from './dtos/signup.dto';
import { AccessTokenDto } from './dtos/acess.dto';
import { isInstitutionalEmail } from './constants/institutional-emails';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserWithProfiles> {
    this.logger.log(`Validando credenciais para usuário: ${username}`);

    const user = (await this.prisma.user.findUnique({
      where: { username },
      include: {
        student: true,
        enterprise: true,
      },
    })) as UserWithProfiles | null;

    if (!user) {
      this.logger.warn(`Tentativa de login com usuário inexistente: ${username}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isDeleted) {
      this.logger.warn(`Tentativa de login com conta excluída: ${username}`);
      throw new UnauthorizedException('Conta do usuário foi excluída');
    }

    if (!user.isActive) {
      this.logger.warn(`Tentativa de login com conta inativa: ${username}`);
      throw new UnauthorizedException('Conta do usuário não está ativa');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Tentativa de login com senha inválida: ${username}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.logger.log(`Login realizado com sucesso para usuário: ${username}`);
    return user;
  }

  /**
   * Sign in user and return tokens
   * Works for all user roles (ADMIN, MODERATOR, STUDENT, ENTERPRISE, TEACHER)
   */
  async signIn(username: string, password: string): Promise<AccessTokenDto> {
    const user = await this.validateUser(username, password);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      uuid: user.uuid,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { ...payload, isRefreshToken: true },
      { expiresIn: '7d' },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      access_token_expires_in: 3600,
      refresh_token_expires_in: 604800,
    };
  }

  /**
   * Sign up new user (students only with institutional email)
   */
  async signUp(signUpDto: SignUpDto): Promise<AccessTokenDto> {
    const { username, email, password, name, description } = signUpDto;

    this.logger.log(`Tentativa de cadastro para usuário: ${username} (${email})`);

    // Validate institutional email (extra validation layer)
    if (!isInstitutionalEmail(email)) {
      this.logger.warn(`Tentativa de cadastro com email não institucional: ${email}`);
      throw new UnprocessableEntityException(
        'Email deve ser de uma instituição educacional válida',
      );
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        this.logger.warn(`Tentativa de cadastro com username já existente: ${username}`);
        throw new ConflictException('Nome de usuário já existe');
      }
      if (existingUser.email === email) {
        this.logger.warn(`Tentativa de cadastro com email já existente: ${email}`);
        throw new ConflictException('Email já está em uso');
      }
    }

    const hashedPassword = await hash(password, 12);

    try {
      const user = await this.prisma.$transaction(
        async (tx): Promise<UserWithProfiles> => {
          // Create user as STUDENT (forced)
          const newUser = (await tx.user.create({
            data: {
              username,
              email,
              password: hashedPassword,
              role: Role.STUDENT, // Always STUDENT for sign-up
              name,
              description,
              isActive: true,
            },
            include: {
              student: true,
              enterprise: true,
            },
          })) as UserWithProfiles;

          // Create student profile (always for sign-up)
          await tx.student.create({
            data: {
              userId: newUser.id,
            },
          });

          return newUser;
        },
      );

      // Generate tokens
      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        uuid: user.uuid,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(
        { ...payload, isRefreshToken: true },
        { expiresIn: '7d' },
      );

      this.logger.log(`Usuário criado com sucesso: ${username} (ID: ${user.id})`);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_in: 3600,
        refresh_token_expires_in: 604800,
      };
    } catch (error) {
      this.logger.error(`Erro ao criar usuário ${username}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw new UnprocessableEntityException('Falha ao criar usuário');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<AccessTokenDto> {
    this.logger.log('Tentativa de renovação de token');

    let payload: RefreshPayload;

    try {
      payload = this.jwtService.verify<RefreshPayload>(refreshToken);
    } catch {
      this.logger.warn('Tentativa de renovação com token inválido');
      throw new UnauthorizedException('Token de renovação inválido');
    }

    if (!payload.isRefreshToken) {
      this.logger.warn('Tentativa de renovação com token que não é refresh token');
      throw new UnauthorizedException('Token não é um token de renovação');
    }

    const user = (await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        student: true,
        enterprise: true,
      },
    })) as UserWithProfiles | null;

    if (!user) {
      this.logger.warn(`Tentativa de renovação para usuário inexistente: ${payload.sub}`);
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isDeleted || !user.isActive) {
      this.logger.warn(`Tentativa de renovação para conta inativa: ${user.username}`);
      throw new UnauthorizedException('Conta do usuário não está ativa');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      username: user.username,
      uuid: user.uuid,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(newPayload);

    this.logger.log(`Token renovado com sucesso para usuário: ${user.username}`);

    return {
      access_token: newAccessToken,
      refresh_token: refreshToken,
      access_token_expires_in: 3600,
      refresh_token_expires_in: 604800,
    };
  }

  /**
   * Find user by ID (for guards and middleware)
   */
  async findUserById(id: number): Promise<UserWithProfiles | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        enterprise: true,
      },
    })) as UserWithProfiles | null;
  }
}
