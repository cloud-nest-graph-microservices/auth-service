import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import qs from 'qs';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Roles } from 'nest-keycloak-connect';

@Injectable()
export class AuthService {
  constructor(private config: ConfigService) {}
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

  async validateToken(token: string): Promise<boolean> {
    try {
      const client = jwksClient({
        jwksUri: `${this.config.get('KEYCLOAK_AUTH_SERVER_URL')}/realms/${this.config.get('KEYCLOAK_REALM')}/protocol/openid-connect/certs`
      });

      const getKey = (header, callback) => {
        client.getSigningKey(header.kid, function (err, key) {
          const signingKey = key.getPublicKey();
          callback(err, signingKey);
        });
      };

      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {}, (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        });
      });

      return !!decoded;
    } catch (err) {
      console.error('Token validation error:', err);
      return false;
    }
  }

  async refreshToken(refreshToken: string) {

  }

  async logout(refreshToken: string){

  }


}
