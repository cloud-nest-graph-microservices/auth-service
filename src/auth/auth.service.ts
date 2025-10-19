import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import qs from 'qs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(private config: ConfigService, @Inject('GATEWAY_CLIENT') private gatewayClient: ClientProxy) {}

  private kcBase = process.env.KEYCLOAK_BASE_URL;
  private realm = process.env.KEYCLOAK_REALM;

  async signup(dto: CreateAuthDto) {
    // 1) Get admin access token via client credentials (or username/password)
    const token = await this.getAdminToken();

    // 2) Create Keycloak user
    const kcUserId = await this.createKeycloakUser(token, dto);

    const payload = { keycloakSub: kcUserId, email: dto.email, fullName: dto.username ?? null };
    const result = await lastValueFrom(this.gatewayClient.send({ cmd: 'create_profile' }, payload));
    // result is the created/updated profile returned by Users service (through Gateway)
    return { kcUserId, profile: result };
  }

  private async getAdminToken(): Promise<string> {
    // Here we use Resource Owner Password Credentials or client credentials depending on your Keycloak setup.
    // Example: get token via username/password (admin)
    const tokenUrl = `${this.kcBase}/realms/${this.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', process.env.KEYCLOAK_ADMIN_CLIENT_ID);
    params.append('username', process.env.KEYCLOAK_ADMIN_USERNAME);
    params.append('password', process.env.KEYCLOAK_ADMIN_PASSWORD);

    // If you use client secret:
    if (process.env.KEYCLOAK_ADMIN_CLIENT_SECRET) {
      params.append('client_secret', process.env.KEYCLOAK_ADMIN_CLIENT_SECRET);
    }

    const r = await axios.post(tokenUrl, params.toString(), {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    return r.data.access_token;
  }

  private async createKeycloakUser(adminToken: string, dto: CreateAuthDto): Promise<string> {
    const url = `${this.kcBase}/admin/realms/${this.realm}/users`;
    const data = {
      username: dto.email,
      email: dto.email,
      enabled: true,
      attributes: { fullName: dto.username ?? '' },
    };
    const r = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: (s) => s >= 200 && s < 400, // create returns 201
    });
    // Keycloak returns location header with user id
    const location = r.headers['location'];
    if (!location) throw new Error('Keycloak did not return location header for created user');
    const parts = location.split('/');
    const kcId = parts[parts.length - 1];
    return kcId;
  }

  async passwordGrant(username: string, password: string) {
    const tokenUrl = `${this.config.get<string>('KEYCLOAK_BASE_URL')}/realms/${this.config.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/token`;
    const data = qs.stringify({
          grant_type: 'password',
          client_id: this.config.get<string>('KEYCLOAK_CLIENT_ID'),
          ...(this.config.get<string>('KEYCLOAK_CLIENT_SECRET') ? { client_secret: this.config.get<string>('KEYCLOAK_CLIENT_SECRET') } : {}),
          username,
          password,
          scope: 'openid',
        });

        try {
          const resp = await axios.post(tokenUrl, data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000,
          });
          return await resp.data;
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data ?? err.message ?? 'Unknown error from Keycloak';
      console.log(message);
      throw new HttpException({ message: 'Keycloak authentication failed', details: message }, status);
    }
  }

  async refreshToken(refreshToken: string) {

  }

  async logout(refreshToken: string){

  }


}
