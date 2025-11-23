import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/services/users.service';
import { LoginUserInput } from './dto/login-user.input';
import { SignInResponse } from './types/signin-response.type';
import { ConfigService } from 'src/config/config.service';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginUserInput: LoginUserInput): Promise<SignInResponse> {
    const user = await this.validateUser(
      loginUserInput.email,
      loginUserInput.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session_uuid = uuidv4();

    const payload = { email: user.email, sub: user.uuid };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: this.configService.jwtExpiresIn,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpiresIn,
    });

    return {
      access_token,
      refresh_token,
      session_uuid,
    };
  }

  async me(uuid: string): Promise<User | null> {
    return this.usersService.asyncFindByUuid(uuid);
  }
}
