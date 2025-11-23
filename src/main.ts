import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable cookie parser
  app.use(cookieParser());

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(configService.port);
  console.log(
    `Application is running on: http://localhost:${configService.port}`,
  );
  console.log(
    `GraphQL Playground: http://localhost:${configService.port}/graphql`,
  );
}
bootstrap();
