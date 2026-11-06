import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersMsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly safeUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  // 1. Crear / Registrar usuario
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'El correo electrónico ya está registrado',
      });
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: this.safeUserSelect,
    });
  }

  // 2. Validar credenciales en Login (Llamado por el Gateway antes de firmar el JWT)
  async validateCredentials(loginDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.isActive) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Credenciales inválidas o usuario inactivo',
      });
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Credenciales inválidas',
      });
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  // 3. Listar todos los usuarios activos (Solo para vista ADMIN)
  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: this.safeUserSelect,
      orderBy: { id: 'asc' },
    });
  }

  // 4. Obtener un usuario por ID (Usado para el perfil y en el método validate de JwtStrategy del Gateway)
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.safeUserSelect,
    });

    if (!user || !user.isActive) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Usuario con ID #${id} no encontrado o inactivo`,
      });
    }

    return user;
  }

  // 5. Obtener múltiples usuarios por arreglo de IDs (Para relacionar Facturas con Usuarios en el Gateway)
  async findByIds(ids: number[]) {
    if (!ids || ids.length === 0) return [];

    return this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  // 6. Editar perfil de usuario
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Verifica que exista y esté activo

    if (updateUserDto.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailTaken && emailTaken.id !== id) {
        throw new RpcException({
          statusCode: HttpStatus.CONFLICT,
          message: 'El nuevo email ya está en uso por otro usuario',
        });
      }
    }

    const dataToUpdate: Partial<UpdateUserDto> = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: this.safeUserSelect,
    });
  }

  // 7. Baja lógica de usuario (Soft delete)
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: this.safeUserSelect,
    });
  }
}