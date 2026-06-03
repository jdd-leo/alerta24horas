import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import { DevLoginDto, GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser } from './current-user.decorator';

function publicUser(user: { id: string; email: string; name: string; picture?: string | null }) {
  return { id: user.id, email: user.email, name: user.name, picture: user.picture };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('google')
  async google(@Body() dto: GoogleLoginDto) {
    const { token, user } = await this.auth.loginWithGoogle(dto.idToken);
    return { token, user: publicUser(user) };
  }

  @Post('dev-login')
  async devLogin(@Body() dto: DevLoginDto) {
    const { token, user } = await this.auth.devLogin(dto.email, dto.name);
    return { token, user: publicUser(user) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return { id: user.sub, email: user.email, name: user.name };
  }
}
