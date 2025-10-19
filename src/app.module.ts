import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakConnectModule } from 'nest-keycloak-connect'
import { AuthModule } from './auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';


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

    ClientsModule.register([
      {
        name: 'GATEWAY_CLIENT',
        transport: Transport.TCP,
        options: {
          host: process.env.GATEWAY_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.GATEWAY_SERVICE_PORT || '4000', 10),
        },
      },
    ]),
    AuthModule,
  ],
  providers: [
    // { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: ResourceGuard },
    // { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
