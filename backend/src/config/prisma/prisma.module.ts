import { DynamicModule, Global, Module, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Global()
@Module({})
export class PrismaModule {
  // Cria um logger específico para registrar mensagens e depurar o código.
  private static readonly logger = new Logger(PrismaModule.name);

  /**
   * Método estático para configurar o módulo de forma síncrona.
   * Permite passar opções opcionais, como middlewares.
   */
  static forRoot(options?: PrismaModuleOptions): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: PrismaService,
          useFactory: () => {
            const service = new PrismaService();
            // Aplica os middlewares fornecidos, se houver.
            this.applyMiddlewares(service, options?.middlewares);
            return service;
          },
        },
      ],
      exports: [PrismaService],
    };
  }

  /**
   * Método estático para configurar o módulo de forma assíncrona.
   * Para quando as configurações dependem de operações assíncronas, como leitura de variáveis de ambiente.
   */
  static forRootAsync(options: PrismaAsyncModuleOptions): DynamicModule {
    return {
      module: PrismaModule,
      // Importa outros módulos necessários(se tiver).
      imports: options.imports || [],
      providers: [
        {
          provide: PrismaService,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            const service = new PrismaService();
            this.applyMiddlewares(service, config.middlewares);
            return service;
          },
          // Injeta dependências necessárias na useFactory.
          inject: options.inject || [],
        },
      ],
      exports: [PrismaService],
    };
  }

  /**
   * Método privado para aplicar middlewares.
   */
  private static applyMiddlewares(
    client: PrismaClient,
    middlewares?: Array<(params: any, next: (params: any) => Promise<any>) => Promise<any>>
  ) {
    if (middlewares?.length) {
      middlewares.forEach(middleware => {
        // Registra cada middleware no PrismaClient.
        client.$use(middleware);
        // Registra uma mensagem informando que o middleware foi registrado.
        this.logger.log(`Prisma middleware registrado`);
      });
    }
  }
}


export interface PrismaModuleOptions {
  middlewares?: Array<(params: any, next: (params: any) => Promise<any>) => Promise<any>>;
  logger?: any;
}


export interface PrismaAsyncModuleOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<PrismaModuleOptions> | PrismaModuleOptions;
  inject?: any[];
}
