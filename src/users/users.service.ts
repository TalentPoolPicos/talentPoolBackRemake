import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/roles.enum';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['student', 'enterprise', 'socialMedia'],
      cache: true,
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['student', 'enterprise', 'socialMedia'],
      cache: true,
    });
  }

  async findByUuid(uuid: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { uuid },
      relations: ['student', 'enterprise', 'socialMedia'],
      cache: true,
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['student', 'enterprise', 'socialMedia'],
      cache: true,
    });
  }

  async findAndCountAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    if (limit < 1) limit = 1;
    if (limit > 20) limit = 20;

    const [users, total] = await this.usersRepository.findAndCount({
      take: limit,
      relations: ['student', 'enterprise', 'socialMedia'],
      skip: (page - 1) * limit,
      cache: true,
    });
    return { users, total };
  }

  async checkIfUserExistsByUsername(username: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return !!user;
  }

  async checkIfUserExistsByEmail(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return !!user;
  }

  async create(user: {
    username: string;
    password: string;
    email: string;
    role?: Role;
  }): Promise<User> {
    if (await this.checkIfUserExistsByUsername(user.username))
      throw new Error('username already exists');

    if (await this.checkIfUserExistsByEmail(user.email))
      throw new Error('email already exists');

    return this.usersRepository.save(user);
  }

  async update(
    id: number,
    user: {
      username?: string;
      password?: string;
      profilePicture?: string;
      email?: string;
      role?: Role;
    },
  ): Promise<User | null> {
    await this.usersRepository.update(id, user);
    return this.usersRepository.findOneBy({ id });
  }

  // Se os dados não forem passados, eles não serão atualizados.
  // Se o username ou email forem passados, eles somente serão atualizados
  // se forem diferentes dos atuais e não existirem em outro usuário.
  async partialUpdate(
    uuid: string,
    username?: string,
    email?: string,
    password?: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { uuid },
      cache: true,
    });
    if (!user) throw new NotFoundException('User not found');

    if (!username && !email && !password)
      throw new BadRequestException('At least one field must be sent');

    if (username) {
      if (await this.checkIfUserExistsByUsername(username))
        throw new ConflictException('Username already exists');

      if (username !== user.username) {
        user.username = username;
      } else {
        throw new ConflictException('This username is already in use');
      }
    }
    if (email) {
      if (email !== user.email) {
        if (await this.checkIfUserExistsByEmail(email))
          throw new ConflictException('Email already exists for another user');

        user.email = email;
      } else {
        throw new ConflictException('This email is already in use');
      }
    }
    if (password) user.password = password;

    await this.usersRepository.save(user);

    return user;
  }

  async updateProfilePictureName(
    id: number,
    profilePicture: string,
  ): Promise<User | null> {
    const result = await this.usersRepository.update(id, { profilePicture });

    if (!result.affected) return null;

    return this.usersRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
