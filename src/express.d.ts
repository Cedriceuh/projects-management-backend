import { JwtTokenPayload } from './auth/types/jwt-token-payload.type';

declare module 'express' {
  export interface Request {
    token?: JwtTokenPayload;
  }
}
