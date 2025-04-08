import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decotaros/public.decorator';
import { SocialmediaService } from './socialmedia.service';
import { CreateSocialMediaDto } from './dtos/create_socialmedia.dto';
import { CustomRequest } from 'src/auth/interfaces/custon_request';
import { SocialMediaDto } from './dtos/socialmedia.dto';

@ApiTags('SocialMedia', 'V1')
@Controller('socialmedia')
export class SocialmediaController {
  constructor(private readonly socialMediaService: SocialmediaService) {}
  @Public()
  @ApiOperation({ summary: 'Get all social media by user' })
  @ApiOkResponse({
    description: 'The list of social media by user',
    type: [SocialMediaDto],
  })
  @Get(':userUuid')
  async findAllSocialMediaByUserUuid(@Param('userUuid') uuid: string) {
    const result = await this.socialMediaService.findAllByUserUuid(uuid);

    return result.map((socialMedia) => ({
      uuid: socialMedia.uuid,
      type: socialMedia.type,
      url: socialMedia.url,
      created_at: socialMedia.createdAt,
      updated_at: socialMedia.updatedAt,
    }));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update a social media' })
  @ApiBadRequestResponse({ description: 'The data provided is invalid' })
  @ApiOkResponse({
    description: 'The social media has been successfully created',
    type: SocialMediaDto,
  })
  @Post()
  async createSocialMedia(
    @Body() socialMedia: CreateSocialMediaDto,
    @Req() req: CustomRequest,
  ) {
    const id = req.user.id;
    const result = await this.socialMediaService.addSocialMedia(
      id,
      socialMedia,
    );

    return {
      uuid: result.uuid,
      type: result.type,
      url: result.url,
      created_at: result.createdAt,
      updated_at: result.updatedAt,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a social media' })
  @ApiOkResponse({
    description: 'The social media has been successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'The social media could not be found',
  })
  @Delete(':uuid')
  async deleteSocialMedia(@Param('uuid') uuid: string) {
    const result = await this.socialMediaService.deleteSocialMedia(uuid);
    return {
      message: 'Social media deleted successfully',
      result,
    };
  }
}
