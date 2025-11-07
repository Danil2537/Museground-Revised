import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

export interface GoogleUser {
  provider: 'google';
  providerId: string;
  email: string;
  username: string;
  picture: string;
  password: null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, name, emails, photos } = profile;

    if (!emails?.length) {
      return done(new Error('Google account has no email'), null);
    }

    const user: GoogleUser = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      username: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim(),
      picture: photos?.[0]?.value ?? '',
      password: null,
    };

    //console.log(`\n\nGoogle validate user: ${JSON.stringify(user, null, 2)}`);

    done(null, user);
  }
}
