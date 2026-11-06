import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario y devolver su JWT' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'create_user' }, registerDto),
    );

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuario con email/password y obtener JWT' })
  async login(@Body() loginDto: LoginDto) {
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'validate_user_credentials' }, loginDto),
    );

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar el token actual y devolver el usuario autenticado' })
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}