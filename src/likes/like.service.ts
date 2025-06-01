import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAdapter } from 'src/adapters/user.adapter';
import { UserDto } from 'src/dtos/user.dto';
import { Like } from 'src/entities/like.entity';
import { SearchQueryDto } from 'src/search/dtos/search_query.dto';
import { SearchService } from 'src/search/search.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { RecommendedUsersPageDto } from './dtos/recommended_users_page.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly usersService: UsersService,
    private readonly searchService: SearchService,
  ) {}

  async recommendedUsers(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<RecommendedUsersPageDto> {
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0');
    if (limit > 20)
      throw new BadRequestException('Limit must be less than or equal to 20');

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const loggedUser = UserAdapter.entityToDto(user);

    const tags = loggedUser.tags.map((tag) => tag.label);

    const usersDtoResults: UserDto[] = [];

    for (const tag of tags) {
      const query: SearchQueryDto = { searchTerm: tag };
      const users = await this.searchService.users(query, page, limit);
      for (const user of users.items) {
        const isExisting = usersDtoResults.some(
          (existingUser) => existingUser.uuid === user.uuid,
        );
        const isDifferentRole = loggedUser.role !== user.role;

        if (!isExisting && isDifferentRole) usersDtoResults.push(user);
      }
    }

    return {
      users: usersDtoResults.slice((page - 1) * limit, page * limit),
      total: usersDtoResults.length,
    };
  }

  private async validateUserLike(
    userId: number,
    userLikeUuid: string,
  ): Promise<{
    user: User;
    userLike: User;
  }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userLike = await this.usersService.findByUuid(userLikeUuid);
    if (!userLike) throw new NotFoundException('User to like not found');

    if (user.id === userLike.id) {
      throw new BadRequestException('You cannot like yourself');
    }

    if (user.role === userLike.role) {
      throw new BadRequestException(
        'You cannot like a user with the same role',
      );
    }

    return { user, userLike };
  }

  async like(userId: number, userLikeUuid: string): Promise<Like> {
    const { user, userLike } = await this.validateUserLike(
      userId,
      userLikeUuid,
    );

    const existingLike = await this.likeRepository.findOne({
      where: {
        initiator: { id: user.id },
        receiver: { id: userLike.id },
      },
    });

    if (existingLike) {
      throw new BadRequestException('You have already liked this user');
    }

    const like = this.likeRepository.create({
      initiator: user,
      receiver: userLike,
    });

    return this.likeRepository.save(like);
  }

  async unlike(userId: number, userLikeUuid: string): Promise<void> {
    const { user, userLike } = await this.validateUserLike(
      userId,
      userLikeUuid,
    );

    const existingLike = await this.likeRepository.findOne({
      where: {
        initiator: { id: user.id },
        receiver: { id: userLike.id },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('You have not liked this user');
    }

    await this.likeRepository.remove(existingLike);
  }

  async findLikesByUserInitiatorId(userInitiatorId: number): Promise<Like[]> {
    const user = await this.usersService.findById(userInitiatorId);
    if (!user) throw new NotFoundException('User not found');
    return this.likeRepository.find({
      where: { initiator: { id: user.id } },
      relations: ['receiver'],
    });
  }

  async findLikesByUserReceiverId(userReceiverId: number): Promise<Like[]> {
    const user = await this.usersService.findById(userReceiverId);
    if (!user) throw new NotFoundException('User not found');

    return this.likeRepository.find({
      where: { receiver: { id: user.id } },
      relations: ['initiator'],
    });
  }

  async hasLiked(userId: number, userLikeUuid: string): Promise<boolean> {
    const { user, userLike } = await this.validateUserLike(
      userId,
      userLikeUuid,
    );

    const existingLike = await this.likeRepository.findOne({
      where: {
        initiator: { id: user.id },
        receiver: { id: userLike.id },
      },
    });

    return !!existingLike;
  }
}
