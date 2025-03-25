import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/entities/user.entity';
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
      cache: true,
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      cache: true,
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAndCountAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      take: limit,
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
      email?: string;
      role?: Role;
    },
  ): Promise<User | null> {
    await this.usersRepository.update(id, user);
    return this.usersRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
