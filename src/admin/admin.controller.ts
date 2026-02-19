import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { MockAuthGuard } from 'src/auth/guards/Mock-auth.guard';
import { AdminService } from './admin.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { ImportVotersDto } from './dto/import-voter.dto';

// src/admin/admin.controller.ts

@ApiTags('Admin Management')
@ApiBearerAuth('access-token')
@UseGuards(MockAuthGuard) // Using the Role-Aware Mock Guard we refined
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('candidates')
  @ApiOperation({
    summary: 'Admin: Add a candidate to a specific election position',
  })
  async createCandidate(@Body() body: CreateCandidateDto) {
    return this.adminService.addCandidate(body);
  }

  @Delete('candidates/:id')
  @ApiOperation({ summary: 'Admin: Remove a candidate from the ballot' })
  async removeCandidate(@Param('id') id: string) {
    return this.adminService.removeCandidate(id);
  }

  @Post('voters/import')
  @ApiOperation({
    summary: 'Admin: Batch import eligible voters (Matric Numbers)',
  })
  async importVoters(@Body() body: ImportVotersDto) {
    // We pass the array of voters to the service for high-speed insertion
    return this.adminService.preRegisterVoters(body.voters);
  }

  /**
   * VOTER LISTING
   * Useful for the Admin to see who has onboarded vs who hasn't.
   */
  @Get('voters')
  @ApiOperation({
    summary: 'Admin: Get all registered voters and their onboarding status',
  })
  async getAllVoters() {
    return this.adminService.listAllVoters();
  }
}
