import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakConnectModule } from 'nest-keycloak-connect'
import { APP_GUARD } from '@nestjs/core';
import { ResourceGuard, RoleGuard, AuthGuard } from 'nest-keycloak-connect';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        authServerUrl: config.get('KEYCLOAK_BASE_URL'),
        realm: config.get('KEYCLOAK_REALM'),
        clientId: config.get('KEYCLOAK_CLIENT_ID'),
        secret: config.get('KEYCLOAK_CLIENT_SECRET'),
        bearerOnly: true,
      }),
    }),
    AuthModule,
  ],
  providers: [
    // { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: ResourceGuard },
    // { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
