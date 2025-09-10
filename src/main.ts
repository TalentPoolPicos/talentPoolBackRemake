import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v3');
  app.enableShutdownHooks();

  if (process.env.ENV === 'production') {
    //
  } else {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
      credentials: true,
      optionsSuccessStatus: 204,
    });

    const config = new DocumentBuilder()
      .setTitle('TalentPool API Documentation')
      .setDescription('Interactive API documentation')
      .setVersion('2')
      .addBearerAuth()
      .addServer('/')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const theme = new SwaggerTheme();
    const options: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
      },
      customCss: theme.getBuffer(SwaggerThemeNameEnum.DRACULA),
    };
    SwaggerModule.setup('doc', app, document, options);
  }

  await app.listen(process.env.PORT || 7000, '0.0.0.0');
}

void bootstrap();
