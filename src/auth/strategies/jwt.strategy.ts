import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
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
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User Not Found ');
    }
    return user;
  }
}
