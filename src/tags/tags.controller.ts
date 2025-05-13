import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Public } from 'src/auth/decotaros/public.decorator';
import { TagDto } from './dtos/tag.dto';
import { CustomRequest } from 'src/auth/interfaces/custon_request';
import { CreateTagDto } from './dtos/create_tag.dto';
import { TagsAdapter } from './tags.adapter';
import { SearchInterceptor } from 'src/search/search.interceptor';

@ApiTags('Tag')
@Controller('tag')
export class TagsController {
  constructor(private readonly tagService: TagsService) {}

  @Public()
  @ApiOperation({ summary: 'Get all tags by user' })
  @ApiOkResponse({
    description: 'The list of tags by user',
    type: [TagDto],
  })
  @Get(':userUuid')
  async findAllByUserUuid(@Param('userUuid') uuid: string) {
    const result = await this.tagService.findAllByUserUuid(uuid);

    return result.map((tag) => TagsAdapter.entityToDto(tag));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update a tag' })
  @ApiBadRequestResponse({ description: 'The data provided is invalid' })
  @ApiOkResponse({
    description: 'The tag has been successfully created',
    type: TagDto,
  })
  @UseInterceptors(SearchInterceptor)
  @Post()
  async create(@Body() tag: CreateTagDto, @Req() req: CustomRequest) {
    const id = req.user.id;
    const result = await this.tagService.add(id, tag.label);

    return TagsAdapter.entityToDto(result);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiBadRequestResponse({ description: 'The data provided is invalid' })
  @ApiOkResponse({
    description: 'The tag has been successfully deleted',
    type: TagDto,
  })
  @UseInterceptors(SearchInterceptor)
  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string) {
    const result = await this.tagService.deleteByUuid(uuid);

    return TagsAdapter.entityToDto(result);
  }
}
