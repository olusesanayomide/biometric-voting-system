import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from '../../generated/prisma/index';
import { ElectionStatus } from '@prisma/client';
import { SubmitVoteDto } from './dto/submit-vote.dto';

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
  async submitVote(userId: string, dto: SubmitVoteDto) {
    const { electionId, selections } = dto;

    // Prisma Transaction applied to esnsure all or nothing
    return this.prismaservice.$transaction(async (tx) => {
      // Has User Already voted
      const existingRecord = await this.prismaservice.voterRecord.findUnique({
        where: { userId_electionId: { userId, electionId } },
      });
      if (existingRecord) {
        throw new ForbiddenException('User Has Already voted ');
      }

      // Validate the election status
      const election = await tx.election.findUnique({
        where: { id: electionId },
      });
      if (!election || election.status !== 'ONGOING') {
        throw new BadRequestException('No ongoing election exists ');
      }
      // Regsiter Voted Record
      await tx.voterRecord.create({
        data: {
          userId,
          electionId,
        },
      });

      // Record Anonymous Ballots
      // Map the selections to include the electioID for the ballot table
      const ballotData = selections.map((s) => ({
        electionId,
        positionId: s.positionId,
        candidateId: s.candidateId,
      }));

      await tx.ballot.createMany({
        data: ballotData,
      });

      return {
        success: true,
        message: 'your vote has been cast anonymously and recorded ',
        timestamp: new Date(),
      };
    });
  }
}
