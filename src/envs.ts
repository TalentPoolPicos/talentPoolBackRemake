import dotenv from 'dotenv';

dotenv.config();

export class Envs {
  static readonly ENV = process.env.ENV ?? 'development';
  static readonly PORT = parseInt(process.env.PORT ?? '3000');
  static readonly DATABASE_TYPE = process.env.DATABASE_TYPE ?? 'mysql';
  static readonly DATABASE_HOST = process.env.DATABASE_HOST ?? 'localhost';
  static readonly DATABASE_PORT = parseInt(process.env.DATABASE_PORT ?? '3306');
  static readonly DATABASE_USERNAME = process.env.DATABASE_USERNAME ?? 'root';
  static readonly DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? 'root';
  static readonly DATABASE_NAME = process.env.DATABASE_NAME ?? 'test';
  static readonly DATABASE_SYNCHRONIZE =
    process.env.DATABASE_SYNCHRONIZE === 'true';

  static readonly DATABASE_ENTITIES =
    process.env.DATABASE_ENTITIES ?? __dirname + '/../**/*.entity{.ts,.js}';

  static isProduction(): boolean {
    return this.ENV === 'production';
  }
}
