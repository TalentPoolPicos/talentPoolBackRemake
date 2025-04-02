import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
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
import { PartialUserDto } from './dtos/partial_user.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CustomRequest } from 'src/auth/interfaces/custon_request';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { profilePicturePath } from 'src/common/constants';

@ApiTags('User', 'V1')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

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

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a user partially',
    description:
      'Update some user data partially. At least one field must be sent.',
  })
  @ApiOkResponse({
    description: 'The user was successfully updated',
    type: UserDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({
    description: 'The username or email is already in use',
  })
  @ApiBadRequestResponse({
    description: 'The model state is invalid',
  })
  @HttpCode(HttpStatus.OK)
  @Patch()
  async partialUpdate(
    @Body() partialUserDto: PartialUserDto,
    @Req() req: CustomRequest,
  ) {
    const uuid = req.user.uuid;

    const { username, email, password } = partialUserDto;

    const result = await this.usersService.partialUpdate(
      uuid,
      username,
      email,
      password,
    );

    return {
      uuid: result.uuid,
      username: result.username,
      email: result.email,
      role: result.role,
      profilePicture: result.profilePicture,
      created_at: result.createdAt,
      updated_at: result.updatedAt,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a new profile picture' })
  @ApiOkResponse({
    description: 'The profile picture was successfully updated',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'Only image files are allowed',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: profilePicturePath,
      limits: { fileSize: 1024 * 1024 * 3 },
      storage: diskStorage({
        destination: profilePicturePath,
        filename: (req, file: Express.Multer.File, callback) => {
          // Generating a unique filename
          const filename =
            crypto
              .createHash('sha256')
              .update(file.originalname + Date.now())
              .digest('hex') + file.mimetype.replace('image/', '.');

          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch('profile-picture')
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    const user = await this.usersService.findById(req.user.id);

    if (!user) throw new NotFoundException('User not found');

    if (user.profilePicture)
      fs.unlinkSync(`${profilePicturePath}/${user.profilePicture}`);
    await this.usersService.update(user.id, { profilePicture: file.filename });
    user.profilePicture = file.filename;

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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiOkResponse({
    description: 'The user was successfully deleted',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  @Delete()
  async delete(@Req() req: CustomRequest) {
    const id = req.user.id;

    const user = await this.usersService.findById(id);

    if (!user) throw new NotFoundException('User not found');

    await this.usersService.delete(user.id);

    return {
      message: 'The user was successfully deleted',
    };
  }
}
