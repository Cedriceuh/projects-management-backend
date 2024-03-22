import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtTokenPayload } from '../auth/types/jwt-token-payload.type';

@Injectable()
export class JwtDecodeMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, _: any, next: () => void) {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      if (token && (await this.jwtService.verifyAsync(token))) {
        const decodedToken: JwtTokenPayload = this.jwtService.decode(token);
        req.token = decodedToken;
      }
    } catch (e) {
      console.error(e);
    }

    next();
  }
}
