import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard, RoleGuard, ResourceGuard, Roles } from 'nest-keycloak-connect';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'signup' })
  async signup(@Body() body: CreateAuthDto) {
    try {
      const result = await this.authService.signup(body);
      return result;
    } catch (err) {
      throw new HttpException(err.message || 'Signup failed', err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    let response = await this.authService.passwordGrant(body.username, body.password);
    return response;
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