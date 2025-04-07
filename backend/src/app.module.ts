import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ItemModule } from './item/item.module';
import { PrismaModule } from './config/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigModule acessível em toda a aplicação sem necessidade de importá-lo em outros módulos
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, 
    }),

    PrismaModule.forRoot({
      middlewares: [
        // Middleware que intercepta todas as queries do Prisma
        async (params, next) => {
          console.log('Prisma query:', params); // Loga os parâmetros da query
          return next(params); // Continua a execução da query
        },
      ],
    }),

    ItemModule,
  ],
})
export class AppModule {}
