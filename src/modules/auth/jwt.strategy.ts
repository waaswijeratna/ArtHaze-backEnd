import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  age: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SECRET_KEY', // Change this in production
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      age: payload.age,
    };
  }
}
