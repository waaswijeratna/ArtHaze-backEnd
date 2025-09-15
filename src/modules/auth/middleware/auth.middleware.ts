/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // List of paths that don't require authentication
    const publicPaths = ['/users/login', '/users/register', '/users/refresh'];

    // Skip middleware for public paths
    if (publicPaths.some((path) => req.path.includes(path))) {
      return next();
    }

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.split(' ')[1]; // Bearer <token>
      if (!token) {
        throw new UnauthorizedException('Invalid token format');
      }

      try {
        const payload = await this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });

        // Add user info to request object
        req['user'] = payload;

        next();
      } catch (error) {
        throw new UnauthorizedException('Token has expired or is invalid');
      }
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }
}
