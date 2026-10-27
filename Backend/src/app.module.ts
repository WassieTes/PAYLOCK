import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MerchantsModule } from './merchants/merchants.module';
import { CreateMerchantsTable1792961004704 } from './merchants/migrations/1792961004704-CreateMerchantsTable';
import { AuthModule } from './auth/auth.module';
import { DevelopersModule } from './developers/developers.module';
import { VerificationModule } from './verification/verification.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT') ?? 5435),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        migrations: [CreateMerchantsTable1792961004704],
        synchronize: true,
      }),
    }),

    MerchantsModule,

    AuthModule,

    DevelopersModule,

    VerificationModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
