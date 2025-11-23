import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserInput } from './dto/login-user.input';
import { SignInResponse } from './types/signin-response.type';
import { Public } from 'src/common/decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => SignInResponse)
  async signIn(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
    @Context() context: { res: Response },
  ): Promise<SignInResponse> {
    const result = await this.authService.login(loginUserInput);

    // Set httpOnly cookies
    context.res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    context.res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    context.res.cookie('session_id', result.session_uuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return result;
  }
}
