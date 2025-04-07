import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap'); 

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], 
    bufferLogs: true, // Armazena os logs em buffer 
  });

  // Recupera o ConfigService (para acessar .env)
  const configService = app.get(ConfigService);

  // Middlewares de segurança e performance
  app.use(helmet()); // Adiciona cabeçalhos de segurança (evita ataques comuns)
  app.use(compression()); // Comprime as respostas HTTP (melhora performance)
  app.use(cookieParser()); // Faz o parse dos cookies das requisições

  // Configuração do CORS
  app.enableCors({
    origin: configService.getOrThrow('CORS_ORIGIN').split(','), 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-XSRF-TOKEN',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Ativa um pipe global de validação para todos os dados recebidos nos endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas nos DTOs
      forbidNonWhitelisted: true, // Dispara erro se vier algo fora do esperado
      transform: true, // Converte automaticamente os dados para os tipos esperados
      transformOptions: {
        enableImplicitConversion: true, // Conversão automática sem usar decorators
      },
    })
  );

  // Define o prefixo global da API (todos os endpoints terão "/api/teceo" antes)
  app.setGlobalPrefix('api/teceo');

  // Configuração do Swagger (documentação da API)
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation') // Título
      .setDescription('The API description') // Descrição
      .setVersion('1.0') // Versão
      .addBearerAuth() // Suporte a autenticação por token
      .addCookieAuth('XSRF-TOKEN') // Suporte a autenticação por cookie
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document); // Gera documentação em /api/docs
  }

  // Escuta sinais de encerramento do sistema
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received. Closing application...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received. Closing application...');
    await app.close();
    process.exit(0);
  });

  // Inicia o servidor 
  const port = configService.get<number>('PORT') || 3333;
  await app.listen(port, () => {
    logger.log(`Application running on port ${port}`);
    logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  });
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
