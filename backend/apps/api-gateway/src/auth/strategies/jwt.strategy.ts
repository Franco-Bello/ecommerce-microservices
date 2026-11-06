import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_jwt_key_ecommerce_2026',
    });
  }

  // Requisito PDF: Llamar al ClientProxy desde el validate para comprobar al usuario
  async validate(payload: JwtPayload) {
    try {
      const user = await firstValueFrom(
        this.usersClient.send({ cmd: 'find_one_user' }, { id: payload.sub }),
      );
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }
      return user; // Se inyecta en req.user
    } catch {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }
  }
}