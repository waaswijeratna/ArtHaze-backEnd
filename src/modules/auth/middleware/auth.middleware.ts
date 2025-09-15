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
    const publicPaths = [
      '/users/login',
      '/users/register',
      '/users/refresh',
      '/moderators/login',
      '/moderators/register',
      '/moderators/refresh',
    ];

    // Skip middleware for public paths
    if (publicPaths.some((path) => req.path.includes(path))) {
      return next();
    }

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Invalid token format');
      }

      try {
        const payload = await this.jwtService.verify(token, {
          secret:
            process.env.JWT_SECRET ||
            'efe555c77a4c77a2243fcfeda3e7f2654443addf3b4142421ae1906d986f88734f559ca50a97cca9da81f4668a2993cd884e9a59a5ea0bf4379980c4406f5599',
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
