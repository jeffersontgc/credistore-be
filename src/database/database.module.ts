import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://neondb_owner:npg_ElwIpg2em0Vo@ep-nameless-brook-ad76ck0a-pooler.c-2.us-east-1.aws.neon.tech/mystore?sslmode=require&channel_binding=require',
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
