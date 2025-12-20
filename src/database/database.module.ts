import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from '../config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { url, host, port, database, username, password } =
          configService.postgres;
        return {
          type: 'postgres',
          url: url,
          host: url ? undefined : host,
          port: url ? undefined : port,
          username: url ? undefined : username,
          password: url ? undefined : password,
          database: url ? undefined : database,

          autoLoadEntities: true,
          synchronize: true, // Cambia a true para que Neon cree las tablas automáticamente

          // OBLIGATORIO PARA NEON
          ssl: url ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
