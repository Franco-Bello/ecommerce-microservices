import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersMsService } from './users-ms.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class UsersMsController {
  constructor(private readonly usersMsService: UsersMsService) {}

  @MessagePattern({ cmd: 'create_user' })
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersMsService.create(createUserDto);
  }

  @MessagePattern({ cmd: 'validate_user_credentials' })
  validateCredentials(@Payload() loginDto: LoginUserDto) {
    return this.usersMsService.validateCredentials(loginDto);
  }

  @MessagePattern({ cmd: 'find_all_users' })
  findAll() {
    return this.usersMsService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_user' })
  findOne(@Payload() payload: { id: number }) {
    return this.usersMsService.findOne(Number(payload.id));
  }

  @MessagePattern({ cmd: 'find_users_by_ids' })
  findByIds(@Payload() payload: { ids: number[] }) {
    return this.usersMsService.findByIds(payload.ids);
  }

  @MessagePattern({ cmd: 'update_user' })
  update(@Payload() payload: { id: number; data: UpdateUserDto }) {
    return this.usersMsService.update(Number(payload.id), payload.data);
  }

  @MessagePattern({ cmd: 'remove_user' })
  remove(@Payload() payload: { id: number }) {
    return this.usersMsService.remove(Number(payload.id));
  }
}