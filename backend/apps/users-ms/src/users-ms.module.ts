import { Module } from '@nestjs/common';
import { UsersMsController } from './users-ms.controller';
import { UsersMsService } from './users-ms.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersMsController],
  providers: [UsersMsService],
})
export class UsersMsModule {}
