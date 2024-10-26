import { Controller, Post, Body, UseGuards, Headers, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Headers('authorization') authorizationHeader: string) {
    const tokens = authorizationHeader.split(' ');
    const accessToken = tokens[1];
    return this.authService.logout(accessToken);
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshToken(@Headers('authorization') authorizationHeader: string) {
    const tokens = authorizationHeader.split(' ');
    const refreshToken = tokens[2]; // Refresh token
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Headers('authorization') authorizationHeader: string) {
    const tokens = authorizationHeader.split(' ');
    const accessToken = tokens[1];
    return this.authService.getMe(accessToken);
  }
}
