import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { LoginMerchantDto } from './dto/login-merchant.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterMerchantDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginMerchantDto) {
    return this.authService.login(dto);
  }
}
