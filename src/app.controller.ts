import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Public()
  @ApiTags('Interface')
  @ApiOperation({
    summary: 'Interface de testes da API',
    description:
      'Acessa a interface web para testar todas as funcionalidades da API',
  })
  @ApiOkResponse({ description: 'Interface de testes carregada' })
  @Get('app')
  getApp(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', 'index.html'));
  }
}
