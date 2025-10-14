import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';


@Module({
  
  imports: [],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
