import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Explicitly enable CORS for local development
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger UI for documentation
  const config = new DocumentBuilder()
    .setTitle('Music App API')
    .setDescription('Core backend for MusicApp (Spotify clone)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3001;
  console.log(`Backend is starting on http://localhost:${port}`);
  console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
  
  await app.listen(port);
}
bootstrap();
