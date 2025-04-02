import { JwtPayload } from './payload';

export interface RefreshPayload extends JwtPayload {
  isRefreshToken: boolean;
}
