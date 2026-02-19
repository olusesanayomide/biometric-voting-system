import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { MockAuthGuard } from 'src/auth/guards/Mock-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ElectionStatus } from '@prisma/client';

@ApiTags('Elections')
@ApiBearerAuth('access-token')
@UseGuards(MockAuthGuard) // This guard now handles the role check automatically
@Controller('elections')
export class ElectionController {
  constructor(private electionService: ElectionService) {}

  @Post('create')
  @Roles('ADMIN') // <--- High Leverage: No more manual if checks!
  @ApiOperation({ summary: 'Admin: Create a new election with positions' })
  async create(@Body() body: CreateElectionDto) {
    return this.electionService.createElections(body);
  }

  @Get('active-ballot')
  @ApiOperation({ summary: 'Voter: Fetch the ongoing election' })
  async getBallot(@GetUser('id') userId: string) {
    return this.electionService.getActiveBallot(userId);
  }

  @Post('vote')
  @Roles('STUDENT', 'ADMIN') // Both can vote (if admin is also a voter)
  @ApiOperation({ summary: 'Voter: Submit an anonymous ballot' })
  async vote(@GetUser('id') userId: string, @Body() body: SubmitVoteDto) {
    return this.electionService.submitVote(userId, body);
  }

  @Patch(':id/status') // Changed from /start to /status for lifecycle flexibility
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: Change election status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ElectionStatus,
  ) {
    // This calls the state-machine logic we discussed
    return this.electionService.trasntitonStatus(id, status);
  }
}
