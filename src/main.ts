import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable cookie parser
  app.use(cookieParser());

  // Ensure body parsing before hitting GraphQL middleware (global and /graphql)
  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
  app.use('/graphql', bodyParser.json({ limit: '2mb' }));
  app.use('/graphql', bodyParser.urlencoded({ extended: true, limit: '2mb' }));

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: ['https://creadistore.vercel.app', 'http://localhost:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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
