import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { LikeService } from './like.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { RecommendedUsersPageDto } from './dtos/recommended_users_page.dto';
import { CustomRequest } from 'src/auth/interfaces/custon_request';
import { LikeDto } from './dtos/like.dto';
import { LikeAdapter } from './like.adapter';
import { IsLikeDto } from './dtos/is_like.dto';
import { UserAdapter } from 'src/adapters/user.adapter';
import { UsersPageDto } from 'src/users/dtos/users_page.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get recommended users',
  })
  @ApiOkResponse({
    description:
      "Returns a list of recommended users based on the logged-in user's tags.",
    type: RecommendedUsersPageDto,
  })
  @ApiNotFoundResponse({})
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid parameters or user not found.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'The page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description:
      'The number of items per page. Default is 10. Max is 20 and min is 1',
  })
  @Get('recommendations')
  async likes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req: CustomRequest,
  ): Promise<RecommendedUsersPageDto> {
    const user = req.user;
    if (!user) throw new NotFoundException('User not found');

    return this.likeService.recommendedUsers(user.id, page, limit);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Like a user',
  })
  @ApiOkResponse({
    description: 'User liked successfully.',
    type: LikeDto,
  })
  @ApiNotFoundResponse({})
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid parameters or user not found.',
  })
  @HttpCode(HttpStatus.OK)
  @Post(':userUuid')
  async like(@Req() req: CustomRequest, @Param('userUuid') userUuid: string) {
    const user = req.user;
    if (!user) throw new NotFoundException('User not found');

    const like = await this.likeService.like(user.id, userUuid);
    if (!like) {
      throw new NotFoundException('User to like not found');
    }

    return LikeAdapter.entityToDto(like);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unlike a user',
  })
  @ApiOkResponse({
    description: 'User unliked successfully.',
  })
  @ApiNotFoundResponse({})
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid parameters or user not found.',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':userUuid')
  async unlike(@Req() req: CustomRequest, @Param('userUuid') userUuid: string) {
    const user = req.user;
    if (!user) throw new NotFoundException('User not found');

    await this.likeService.unlike(user.id, userUuid);

    return { message: 'User unliked successfully' };
  }

  @ApiOperation({
    summary: 'Get users you have liked',
  })
  @ApiOkResponse({
    description: 'Returns a list of users you have liked.',
    type: UsersPageDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found or invalid parameters.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'The page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description:
      'The number of items per page. Default is 10. Max is 20 and min is 1',
  })
  @HttpCode(HttpStatus.OK)
  @Get('initiator/:userUuid')
  async initiatorLikes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('userUuid') userUuid: string,
  ): Promise<UsersPageDto> {
    if (!userUuid) throw new NotFoundException('User not found');
    if (page < 1) throw new NotFoundException('Page must be greater than 0');
    if (limit < 1) throw new NotFoundException('Limit must be greater than 0');
    if (limit > 20)
      throw new NotFoundException('Limit must be less than or equal to 20');
    if (page > 100)
      throw new NotFoundException('Page must be less than or equal to 100');

    let likes = await this.likeService.findLikesByUserInitiatorUuid(userUuid);
    const total = likes.length;
    likes = likes.slice((page - 1) * limit, page * limit);
    const users = likes.map((like) => UserAdapter.entityToDto(like.receiver));

    return {
      users,
      total,
    };
  }

  @ApiOperation({
    summary: 'Get users who have liked you',
  })
  @ApiOkResponse({
    description: 'Returns a list of users who have liked you.',
    type: UsersPageDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found or invalid parameters.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'The page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description:
      'The number of items per page. Default is 10. Max is 20 and min is 1',
  })
  @HttpCode(HttpStatus.OK)
  @Get('receiver/:userUuid')
  async receiverLikes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('userUuid') userUuid: string,
  ): Promise<UsersPageDto> {
    if (!userUuid) throw new NotFoundException('User not found');
    if (page < 1) throw new NotFoundException('Page must be greater than 0');
    if (limit < 1) throw new NotFoundException('Limit must be greater than 0');
    if (limit > 20)
      throw new NotFoundException('Limit must be less than or equal to 20');
    if (page > 100)
      throw new NotFoundException('Page must be less than or equal to 100');

    let likes = await this.likeService.findLikesByUserReceiverUuid(userUuid);
    const total = likes.length;
    likes = likes.slice((page - 1) * limit, page * limit);
    const users = likes.map((like) => UserAdapter.entityToDto(like.initiator));

    return {
      users,
      total,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check if user has liked another user',
  })
  @ApiOkResponse({
    description: 'Returns true if the user has liked the other user.',
    type: IsLikeDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found or invalid parameters.',
  })
  @Get('has-liked/:userUuid')
  async hasLiked(
    @Req() req: CustomRequest,
    @Param('userUuid') userUuid: string,
  ): Promise<IsLikeDto> {
    const user = req.user;
    if (!user) throw new NotFoundException('User not found');

    const hasLiked = await this.likeService.hasLiked(user.id, userUuid);
    return {
      isLike: hasLiked,
    };
  }
}
