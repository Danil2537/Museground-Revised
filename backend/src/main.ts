import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import {
    Injectable,
    CallHandler,
    ExecutionContext,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
  
  @Injectable()
  export class TraceInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const handler = context.getHandler().name;
      const className = context.getClass().name;
  
      console.log(`--> Entering: ${className}.${handler}()`);
  
      return next.handle().pipe(
        tap(() => {
          console.log(`<-- Exiting: ${className}.${handler}()`);
        }),
      );
    }
  }

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Properly typed middleware usage
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TraceInterceptor());
  //   app.enableCors({
  //     origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  //     credentials: true,
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //     allowedHeaders:
  //       'Content-Type, Accept, Authorization, Access-Control-Allow-Origin',
  //   });
  app.enableCors({
    origin: ['http://localhost:3000', 'https://museground.netlify.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // important for cookies/authorization headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'Set-Cookie', // allow frontend to see cookies in response
    ],
  });
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;

  await app.listen(port);
  console.log(`API listening on ${port}`);
}

// Explicitly handle promise to avoid floating-promises lint warning
void bootstrap();
