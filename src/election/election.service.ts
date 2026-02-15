import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from '../../generated/prisma/index';
import { ElectionStatus } from '@prisma/client';

@Injectable()
export class ElectionService {
  constructor(private prismaservice: PrismaService) {}

  // Admin Create election with postions
  async createElections(data: {
    title: string;
    eligibleTypes: UserType[];
    positions: string[];
  }) {
    return this.prismaservice.election.create({
      data: {
        title: data.title,
        eligibleTypes: data.eligibleTypes,
        status: ElectionStatus.DRAFT,
        positions: {
          create: data.positions.map((name) => ({ name })),
        },
      },
    });
  }

  // Admin add candidate to position
  async addCandidateToPosition(
    positionId: string,
    data: { name: string; bio?: string; imageUrl: string },
  ) {
    return this.prismaservice.candidate.create({
      data: {
        ...data,
        positionId,
      },
    });
  }

  //   Admin Start the election
  async startelection(electionId: string) {
    return this.prismaservice.election.update({
      where: { id: electionId },
      data: { status: ElectionStatus.ONGOING },
    });
  }

  async getActiveBallot(userid: string) {
    // Get the user from the database
    const user = await this.prismaservice.user.findUnique({
      where: { id: userid },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch ongoing election thta matches the user type
    const election = await this.prismaservice.election.findFirst({
      where: {
        status: 'ONGOING',
        eligibleTypes: { has: user.userType },
      },
      include: {
        positions: {
          include: { candidates: true },
        },
      },
    });
    if (!election) {
      throw new NotFoundException(
        'No active election found for your user type',
      );
    }
    // check if the user has already voted in this election
    const alreadyVoted = await this.prismaservice.voterRecord.findUnique({
      where: {
        userId_electionId: { userId: userid, electionId: election.id },
      },
    });
    if (alreadyVoted) {
      throw new ForbiddenException('You have already voted in this election');
    }
    return election;
  }
}
