import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Facturas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(
    @Inject('INVOICES_SERVICE') private readonly invoicesClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  // Auxiliar de orquestación: Cruza las facturas de MongoDB con los usuarios de PostgreSQL
  private async enrichInvoicesWithUsers(invoices: any[]) {
    if (!invoices || invoices.length === 0) return [];

    const uniqueUserIds = Array.from(
      new Set(invoices.map((inv) => Number(inv.userId))),
    );

    const users: any[] = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_users_by_ids' }, { ids: uniqueUserIds }),
    );

    const userMap = new Map(users.map((u) => [u.id, u]));

    return invoices.map((inv) => ({
      ...inv,
      user: userMap.get(Number(inv.userId)) || {
        id: inv.userId,
        name: 'Usuario no disponible',
        email: '-',
      },
    }));
  }

  @Get('my-invoices')
  @ApiOperation({ summary: 'Listar todas mis facturas (Cualquier usuario autenticado)' })
  async findMyInvoices(@CurrentUser() user: any) {
    const invoices = await firstValueFrom(
      this.invoicesClient.send(
        { cmd: 'find_user_invoices' },
        { userId: user.id },
      ),
    );
    return this.enrichInvoicesWithUsers(invoices);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Listar todas las facturas del sistema con los datos del usuario comprador (Solo ADMIN)',
  })
  async findAll() {
    const invoices = await firstValueFrom(
      this.invoicesClient.send({ cmd: 'find_all_invoices' }, {}),
    );
    return this.enrichInvoicesWithUsers(invoices);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de una factura por ID (Propia o ADMIN)' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const invoice = await firstValueFrom(
      this.invoicesClient.send({ cmd: 'find_one_invoice' }, { id }),
    );

    if (user.role !== Role.ADMIN && invoice.userId !== user.id) {
      throw new ForbiddenException('No tienes permiso para ver esta factura');
    }

    const [enriched] = await this.enrichInvoicesWithUsers([invoice]);
    return enriched;
  }
}