import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Public } from 'src/auth/decotaros/public.decorator';

@ApiTags('Downloads', 'V1')
@Controller('downloads')
export class DownloadsController {
  @Public()
  @ApiOperation({ summary: 'Return the profile picture' })
  @ApiOkResponse({
    description: 'The profile picture',
    type: 'image/jpeg',
  })
  @ApiConsumes('image/jpeg', 'image/png')
  @ApiNotFoundResponse({ description: 'Image not found' })
  @HttpCode(HttpStatus.OK)
  @Get('public/images/:filename')
  getProfilePicture(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    fs.createReadStream(filePath)
      .on('error', () => {
        throw new NotFoundException('Image not found');
      })
      .pipe(res.type(contentType));
  }
}
