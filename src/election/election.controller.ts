import { Controller, Get } from '@nestjs/common';
import { ElectionService } from './election.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('elections')
export class ElectionController {
  constructor(private electionService: ElectionService) {}

@Post ('create'){
    async create (@Body('property', pipes))
}

  @Get('active-ballot')
  async getBallot(@GetUser('id') userId: string) {
    return this.electionService.getActiveBallot(userId);
  }
}
