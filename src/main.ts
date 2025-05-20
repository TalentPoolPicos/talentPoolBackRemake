import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  if (process.env.ENV === 'production') {
    //
  } else {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('Interactive API documentation')
      .setVersion('1')
      .addBearerAuth()
      .addServer('/')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const theme = new SwaggerTheme();
    const options = {
      explorer: true,
      customCss: theme.getBuffer(SwaggerThemeNameEnum.DRACULA),
    };
    SwaggerModule.setup('api', app, document, options);
  }

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

void bootstrap();
