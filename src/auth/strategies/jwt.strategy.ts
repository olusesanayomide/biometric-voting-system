import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  prisma: any;
  constructor(private configService: ConfigService) {
    super({
      //Tells pasport where to look for the token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //Fetches the secret from the env file.
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }
  // this method run after the token has ben decrypted
  //what ever is returned here is what nestjs attaches to a request
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
