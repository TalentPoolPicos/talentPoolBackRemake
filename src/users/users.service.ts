import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/roles.enum';
import { Enterprise } from 'src/entities/enterprise.entity';
import { SocialMedia } from 'src/entities/socialmedia.entity';
import { Student } from 'src/entities/student.entity';
import { Tag } from 'src/entities/tag.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>,
    @InjectRepository(SocialMedia)
    private readonly socialMediaRepository: Repository<SocialMedia>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private async loadStudent(user: User): Promise<User> {
    if (user.role === Role.STUDENT.valueOf()) {
      const student = await this.studentsRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (student) {
        user.student = student;
      }
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    let user = await this.usersRepository.findOne({
      where: { username },
      relations: ['socialMedia', 'tag'],
      cache: true,
    });

    if (!user) return null;

    user = await this.loadStudent(user);

    return user;
  }

  async findById(id: number): Promise<User | null> {
    let user = await this.usersRepository.findOne({
      where: { id },
      relations: ['socialMedia', 'tag'],
      cache: true,
    });

    if (!user) return null;

    user = await this.loadStudent(user);

    return user;
  }

  async findByUuid(uuid: string): Promise<User | null> {
    let user = await this.usersRepository.findOne({
      where: { uuid },
      relations: ['socialMedia', 'tag'],
      cache: true,
    });

    if (!user) return null;

    user = await this.loadStudent(user);

    return user;
  }

  async findAll(): Promise<User[]> {
    let users = await this.usersRepository.find({
      relations: ['socialMedia', 'tag'],
      cache: true,
    });

    if (!users) return [];

    users = await Promise.all(users.map((u) => this.loadStudent(u)));

    return users;
  }

  async findAndCountAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    if (limit < 1) limit = 1;
    if (limit > 20) limit = 20;

    const [users, total] = await this.usersRepository.findAndCount({
      take: limit,
      relations: ['socialMedia', 'tag'],
      skip: (page - 1) * limit,
      cache: true,
    });

    if (!users) return { users: [], total: 0 };

    const usersWithStudent = await Promise.all(
      users.map((user) => this.loadStudent(user)),
    );

    return { users: usersWithStudent, total };
  }

  async checkIfUserExistsByUsername(username: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({ where: { username } });
      return !!user;
    } catch {
      return false;
    }
  }

  async checkIfUserExistsByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      return !!user;
    } catch {
      return false;
    }
  }

  async create(dto: {
    username: string;
    password: string;
    email: string;
    role: Role;
  }): Promise<User> {
    if (await this.checkIfUserExistsByUsername(dto.username))
      throw new ConflictException('username already exists');

    if (await this.checkIfUserExistsByEmail(dto.email))
      throw new ConflictException('email already exists');

    return await this.dataSource.transaction(async (manager) => {
      const usersRepo = manager.getRepository(User);
      const studentsRepo = manager.getRepository(Student);
      const enterpriseRepo = manager.getRepository(Enterprise);

      const user = usersRepo.create(dto);
      await usersRepo.save(user);

      if (dto.role === Role.STUDENT) {
        const student = studentsRepo.create({ user });
        await studentsRepo.save(student);
        user.student = student;
      } else if (dto.role === Role.ENTERPRISE) {
        const enterprise = enterpriseRepo.create({ user });
        await enterpriseRepo.save(enterprise);
        user.enterprise = enterprise;
      }

      return user;
    });
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
    let user = await this.usersRepository.findOne({
      where: { uuid },
      relations: ['socialMedia', 'tag'],
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

    user = await this.loadStudent(user);

    return user;
  }

  async updateProfilePicture(
    id: number,
    profilePicture: string,
    profilePictureUuid: string,
  ): Promise<User | null> {
    const result = await this.usersRepository.update(id, {
      profilePicture,
      profilePictureUuid,
    });

    if (!result.affected) return null;

    return this.usersRepository.findOneBy({ id });
  }

  async updateBannerPicture(
    id: number,
    bannerPicture: string,
    bannerPictureUuid: string,
  ): Promise<User | null> {
    const result = await this.usersRepository.update(id, {
      bannerPicture,
      bannerPictureUuid,
    });

    if (!result.affected) return null;

    return this.usersRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepository.delete({ id });
  }
}
