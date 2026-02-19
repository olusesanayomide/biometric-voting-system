import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ElectionService } from './election/election.service';
import { ElectionController } from './election/election.controller';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { ElectionModule } from './election/election.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    AdminModule,
    ElectionModule,
  ],
  controllers: [AppController, ElectionController, AdminController],
  providers: [AppService, ElectionService, AdminService],
})
export class AppModule {}
