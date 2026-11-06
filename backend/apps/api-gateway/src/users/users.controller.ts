import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Ver mi propio perfil (Cualquier usuario autenticado)' })
  getMyProfile(@CurrentUser() user: any) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'find_one_user' }, { id: user.id }),
    );
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Editar mi propio perfil (Cualquier usuario autenticado)' })
  updateMyProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return firstValueFrom(
      this.usersClient.send(
        { cmd: 'update_user' },
        { id: user.id, data: updateUserDto },
      ),
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios activos (Solo ADMIN)' })
  findAll() {
    return firstValueFrom(this.usersClient.send({ cmd: 'find_all_users' }, {}));
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener un usuario por ID (Solo ADMIN)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'find_one_user' }, { id }),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Dar de baja lógica a un usuario (Solo ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'remove_user' }, { id }),
    );
  }
}