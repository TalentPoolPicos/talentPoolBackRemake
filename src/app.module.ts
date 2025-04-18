import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RouterModule } from '@nestjs/core';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { StudentsModule } from './students/students.module';
import { SocialmediaModule } from './socialmedia/socialmedia.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true', // Set to false in production
    }),
    MinioModule,
    UsersModule,
    RouterModule.register([{ path: '/api/v1', module: UsersModule }]),
    AuthModule,
    RouterModule.register([{ path: '/api/v1', module: AuthModule }]),
    EnterpriseModule,
    RouterModule.register([{ path: '/api/v1', module: EnterpriseModule }]),
    StudentsModule,
    RouterModule.register([{ path: '/api/v1', module: StudentsModule }]),
    SocialmediaModule,
    RouterModule.register([{ path: '/api/v1', module: SocialmediaModule }]),
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
