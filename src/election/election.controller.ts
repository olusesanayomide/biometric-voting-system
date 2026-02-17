import {
  Controller,
  Post,
  Get,
  Body,
  // UseGuards,
  ForbiddenException,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@ApiTags('Elections') // Groups these in the Swagger UI
@ApiBearerAuth() // Shows the "Lock" icon for JWT in Swagger
@UseGuards(JwtAuthGuard)
@Controller('elections')
export class ElectionController {
  constructor(private electionService: ElectionService) {}

  @Post('create')
  @ApiOperation({ summary: 'Admin: Create a new election with positions' })
  @ApiResponse({ status: 201, description: 'Election created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Admin access required.',
  })
  async create(@Body() body: CreateElectionDto, @GetUser('role') role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.electionService.createElections(body);
  }

  @Get('active-ballot')
  @ApiOperation({
    summary: 'Voter: Fetch the currently ongoing election and candidates',
  })
  @ApiResponse({
    status: 200,
    description: "Returns election details if eligible and hasn't voted.",
  })
  async getBallot(@GetUser('id') userId: string) {
    return this.electionService.getActiveBallot(userId);
  }

  @Post('vote')
  @ApiOperation({ summary: 'Voter: Submit an anonymous ballot' })
  @ApiResponse({ status: 201, description: 'Vote successfully recorded.' })
  @ApiResponse({
    status: 403,
    description: 'User has already voted or is ineligible.',
  })
  async vote(@GetUser('id') userId: string, @Body() body: SubmitVoteDto) {
    return this.electionService.submitVote(userId, body);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Admin: Change election status to ONGOING' })
  async start(@Param('id') id: string, @GetUser('role') role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.electionService.startelection(id);
  }
}
