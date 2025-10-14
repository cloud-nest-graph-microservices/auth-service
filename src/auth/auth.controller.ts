import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard, RoleGuard, ResourceGuard, Roles } from 'nest-keycloak-connect';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    let response = await this.authService.passwordGrant(body.username, body.password);
    return response;
  }

   @Post('validate-token')
  async validateToken(@Body('token') token: string) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }
    const isValid = await this.authService.validateToken(token);
    if (!isValid) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return { valid: true };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Refresh token is required', HttpStatus.BAD_REQUEST);
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('Refresh token is required', HttpStatus.BAD_REQUEST);
    }
    return this.authService.logout(refreshToken);
  }



  @Get('me')
  // @UseGuards(AuthGuard, ResourceGuard)
  async me(@Req() req) {
    // token decoded info is in req.kauth
    return req.kauth?.grant?.access_token?.content || req.user || { msg: 'no token found' };
  }


  @Get('protected')
  // @UseGuards(AuthGuard, ResourceGuard, RoleGuard)
  @Roles({ roles: ['user'] })
  getProtected() {
    return { secret: 'only users can see this' };
  }
}