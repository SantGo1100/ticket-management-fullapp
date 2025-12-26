import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend integration
  // Support multiple origins (local development and production)
  const frontendUrls = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3001'];
  
  app.enableCors({
    origin: frontendUrls,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-account-sid', 'x-api-key'],
  });
  
  // Global exception filter to ensure proper error responses
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configure Swagger only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Ticket_API')
      .setDescription('REST API for managing support tickets')
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-account-sid',
          description: 'Account SID (identifier)',
        },
        'x-account-sid',
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API Key (secret)',
        },
        'x-api-key',
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Get port from environment (Railway provides PORT)
  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Railway
  console.log(`Application is running on port ${port}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
  }
}

bootstrap();



