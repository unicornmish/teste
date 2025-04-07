import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService 
  // A classe estende o PrismaClient com tipos para log ('query', 'error', 'info', 'warn')
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'info' | 'warn'>
  // Também implementa dois ciclos de vida do NestJS: ao iniciar e ao destruir o módulo
  implements OnModuleInit, OnModuleDestroy {
  
  // Logger do NestJS para registrar mensagens no terminal
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Chama o construtor do PrismaClient com configuração para os eventos de log
    super({
      log: [
        { emit: 'event', level: 'query' }, // eventos de query (consultas)
        { emit: 'event', level: 'error' }, // eventos de erro
        { emit: 'event', level: 'info' },  // mensagens informativas
        { emit: 'event', level: 'warn' },  // avisos
      ],
      errorFormat: 'minimal', // formato mais simples de erro
    });

    // Chama o método que configura os listeners de eventos
    this.setupEventListeners();
  }

  // Configura os listeners para eventos de log
  private setupEventListeners() {
    // Só exibe queries no terminal se estiver em ambiente de desenvolvimento(padrão)
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e: Prisma.QueryEvent) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Exibe erros
    this.$on('error', (e: Prisma.LogEvent) => {
      this.logger.error(`Error: ${e.message}`);
    });

    // Exibe avisos
    this.$on('warn', (e: Prisma.LogEvent) => {
      this.logger.warn(`Warning: ${e.message}`);
    });

    // Exibe informações gerais
    this.$on('info', (e: Prisma.LogEvent) => {
      this.logger.log(`Info: ${e.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect(); 
      this.logger.log('Prisma connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error instanceof Error ? error.stack : error);
      throw error; 
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect(); 
      this.logger.log('Prisma disconnected from the database');
    } catch (error) {
      this.logger.error('Error during disconnection', error instanceof Error ? error.stack : error);
    }
  }

  // Método utilitário para usar transações (executa várias operações de forma segura)
  async transactional<T>(
    operations: (prisma: Prisma.TransactionClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number }
  ): Promise<T> {
    return this.$transaction(operations, options);
  }

  // Método para verificar se o banco está funcionando corretamente
  async checkHealth(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`; // executa uma consulta simples
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error instanceof Error ? error.stack : error);
      return false; 
    }
  }
}
