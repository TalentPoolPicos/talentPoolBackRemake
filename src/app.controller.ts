import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decotaros/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @ApiOperation({ summary: 'Hello world' })
  @ApiOkResponse({ description: 'Hello world' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
