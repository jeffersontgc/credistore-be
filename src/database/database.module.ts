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
        const { host, port, database, username, password } =
          configService.postgres;
        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: false,
          retryAttempts: 10,
          retryDelay: 3000,
          maxQueryExecutionTime: 5000, // Log slow queries (>5s)
          extra: {
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
            max: 20, // Maximum pool size
            min: 5, // Minimum pool size
            // Transaction isolation level for PostgreSQL
            // READ COMMITTED prevents dirty reads and ensures data consistency
            statement_timeout: 300000, // 5 minutes
          },
        };
      },
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
