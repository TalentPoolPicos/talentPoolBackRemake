export interface JwtPayload {
  sub: number; // subject (user id)
  username: string;
  uuid: string;
  role: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}
