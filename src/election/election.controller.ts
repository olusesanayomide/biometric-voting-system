import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { MockAuthGuard } from 'src/auth/guards/Mock-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ElectionCreatedResponseDto } from './dto/election.-response.dto';
import { UpdateElectionStatusDto } from './dto/update-election-status.dto';

@ApiTags('Elections')
@ApiBearerAuth('access-token')
@UseGuards(MockAuthGuard) // This guard now handles the role check automatically
@Controller('elections')
export class ElectionController {
  constructor(private electionService: ElectionService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: Create a new election with positions' })
  @ApiResponse({
    status: 201,
    description: 'Election successfully created in DRAFT state.',
    type: ElectionCreatedResponseDto,
  })
  async create(@Body() body: CreateElectionDto) {
    // Your service returns the Prisma promise, which NestJS resolves automatically
    return this.electionService.createElections(body);
  }

  @Get('active-ballot')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Voter: Fetch the ongoing election and candidates',
    description:
      'Returns the current active election including all positions and eligible candidates for the logged-in voter.',
  })
  @ApiResponse({
    status: 200,
    description: 'The full ballot structure',
    // type: ElectionResponseDto // If you have one, use it here!
  })
  async getBallot(@GetUser('id') userId: string) {
    return this.electionService.getActiveBallot(userId);
  }

  @Post('vote')
  @Roles('STUDENT', 'ADMIN') // Both can vote (if admin is also a voter)
  @ApiOperation({ summary: 'Voter: Submit an anonymous ballot' })
  async vote(@GetUser('id') userId: string, @Body() body: SubmitVoteDto) {
    return this.electionService.submitVote(userId, body);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: Change election status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateElectionStatusDto, // This makes the box appear in Swagger
  ) {
    // Pass body.status to your service
    return this.electionService.trasntitonStatus(id, body.status);
  }
}
