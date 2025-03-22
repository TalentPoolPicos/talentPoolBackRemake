import dotenv from 'dotenv';

dotenv.config();

export class Envs {
  static readonly env = process.env.ENV ?? 'development';
  static readonly port = parseInt(process.env.PORT ?? '3000');

  static isProduction(): boolean {
    return this.env === 'production';
  }
}
