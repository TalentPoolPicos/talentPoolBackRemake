import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UsersPageDto } from './dtos/users_page.dto';
import { UserDto } from 'src/dtos/user.dto';
import { Public } from 'src/auth/decotaros/public.decorator';

@ApiTags('User', 'V1')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @ApiOperation({ summary: 'Get users by pages' })
  @ApiOkResponse({
    description: 'The list of users and the total number of users',
    type: UsersPageDto,
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
  @Get()
  async findByPage(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.usersService.findAndCountAll(page, limit);
    return {
      users: result.users.map((user) => {
        return {
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        };
      }),
      total: result.total,
    };
  }

  @Public()
  @ApiOperation({ summary: 'Get a user by uuid' })
  @ApiOkResponse({
    description: 'The user',
    type: UserDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const user = await this.usersService.findByUuid(uuid);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
