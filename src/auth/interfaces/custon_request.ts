import { Request } from 'express';
import { JwtPayload } from './payload';

export interface CustomRequest extends Request {
  user: JwtPayload;
}
