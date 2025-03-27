import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

import { User } from 'src/entities/user.entity';
import { compare, hash } from 'bcrypt';
import { Role } from 'src/common/enums/roles.enum';
import { JwtPayload } from './interfaces/payload';
import { RefreshPayload } from './interfaces/refresh';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException();

    const userPassword = user.password;
    const isPasswordValid = await compare(password, userPassword);

    if (isPasswordValid) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }

  async signIn(username: string, password: string) {
    const user = await this.validateUser(username, password);

    const payload: JwtPayload = {
      username: user.username,
      id: user.id,
      uuid: user.uuid,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { ...payload, isRefreshToken: true },
        {
          expiresIn: '7d',
        },
      ),
      access_token_expires_in: Date.now() + 3600,
      refresh_token_expires_in: Date.now() + 604800,
      user: {
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_picture: user.profilePicture,
        created_at: user.createdAt,
        update_at: user.updatedAt,
      },
    };
  }

  async signUp(username: string, email: string, password: string, role: Role) {
    try {
      const cryptPassword = await hash(password, 10);
      const user = await this.usersService.create({
        username,
        email,
        password: cryptPassword,
        role,
      });
      return this.signIn(user.username, password);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('username'))
          throw new ConflictException('User already exists');
        else if (error.message.includes('email'))
          throw new ConflictException('Email already exists');
        else throw new UnprocessableEntityException();
      } else throw new UnprocessableEntityException();
    }
  }

  async refresh(refreshToken: string) {
    let payload: RefreshPayload;
    try {
      payload = this.jwtService.verify<RefreshPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.id);

    if (!user) throw new NotFoundException();

    if (payload.isRefreshToken) {
      return {
        access_token: this.jwtService.sign({
          username: payload.username,
          id: payload.id,
          uuid: payload.uuid,
          role: payload.role,
        }),
        refresh_token: refreshToken,
        access_token_expires_in: Date.now() + 3600,
        refresh_token_expires_in: Date.now() + 604800,
        user: {
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          role: user.role,
          profile_picture: user.profilePicture,
          created_at: user.createdAt,
          update_at: user.updatedAt,
        },
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
