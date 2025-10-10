import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

export type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const extractJwtFromCookie = (req: Request): string | null => {
      if (!req) return null;

      // Ensure req.cookies exists
      const cookies = req.cookies as Record<string, string> | undefined;
      const tokenFromCookie: string | undefined = cookies?.access_token;
      if (tokenFromCookie) return tokenFromCookie;

      const tokenFromHeader: string | null =
        ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? null;
      return tokenFromHeader;
    };

    super({
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      jwtFromRequest: extractJwtFromCookie,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ id: string; username: string }> {
    const user = await this.usersService.findOne(payload.username);
    if (!user) throw new UnauthorizedException('Please log in to continue');

    return { id: payload.sub, username: payload.username };
  }
}
