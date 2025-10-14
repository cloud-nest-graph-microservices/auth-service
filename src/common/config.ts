import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  keycloak: {
    issuer: process.env.KEYCLOAK_ISSUER!,
    realm: process.env.KEYCLOAK_REALM!,
    clientId: process.env.KEYCLOAK_CLIENT_ID!,
    adminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
    adminClientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
    adminTokenUrl: process.env.KEYCLOAK_ADMIN_TOKEN_URL!,
    baseUrl: process.env.KEYCLOAK_BASE_URL!,
    adminRealm: process.env.KEYCLOAK_ADMIN_REALM || 'master',
  },
};
