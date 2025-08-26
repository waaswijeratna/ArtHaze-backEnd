import * as dotenv from 'dotenv';

dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app)); // Enable WebSockets
  app.enableCors(); // Allow cross-origin connections
  // app.enableCors({
  //   origin: 'http://localhost:3000',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });

  await app.listen(process.env.PORT ?? 5000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
