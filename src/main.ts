import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.ENV === 'production') {
    app.enableCors();
  } else {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('Interactive API documentation')
      .setVersion('1')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const theme = new SwaggerTheme();
    const options = {
      explorer: true,
      customCss: theme.getBuffer(SwaggerThemeNameEnum.DRACULA),
    };
    SwaggerModule.setup('api', app, document, options);
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
