import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
  }

  get jwtRefreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'your-refresh-secret-key'
    );
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  get databaseHost(): string {
    return this.configService.get<string>('DB_HOST') || 'localhost';
  }

  get databasePort(): number {
    return this.configService.get<number>('DB_PORT') || 5432;
  }

  get databaseUsername(): string {
    return this.configService.get<string>('DB_USERNAME') || 'postgres';
  }

  get databasePassword(): string {
    return this.configService.get<string>('DB_PASSWORD') || 'postgres';
  }

  get databaseName(): string {
    return this.configService.get<string>('DB_NAME') || 'credistore';
  }

  get port(): number {
    return this.configService.get<number>('PORT') || 3000;
  }
}
