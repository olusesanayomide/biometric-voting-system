import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from '@prisma/client';
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
    electionId: string,
    positionId: string,
    data: { name: string; bio?: string; imageUrl: string },
  ) {
    return this.prismaservice.candidate.create({
      data: {
        ...data,
        electionId,
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
        // If user is ADMIN, they see ALL ongoing elections.
        // If not, they only see ones matching their type.
        ...(user.role !== 'ADMIN' && {
          eligibleTypes: { has: user.userType },
        }),
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
    if (user.role !== 'ADMIN') {
      const alreadyVoted = await this.prismaservice.voterRecord.findUnique({
        where: {
          userId_electionId: { userId: userid, electionId: election.id },
        },
      });
      if (alreadyVoted) {
        throw new ForbiddenException('You have already voted in this election');
      }
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

  // Election state managment
  async trasntitonStatus(electionid: string, nextstatus: ElectionStatus) {
    // 1. Checl for Ongoin election
    const election = await this.prismaservice.election.findUnique({
      where: { id: electionid },
    });
    if (!election) {
      throw new NotFoundException('election not found ');
    }
    const currentstatus = election.status;

    // 2. State mangement Rules
    // Rule1 Cannot modify completed elections
    if (currentstatus === ElectionStatus.COMPLETED) {
      throw new BadRequestException(
        'Election has been completed and cannot be changed.',
      );
    }
    // Rule 2 Cannot pause unless it currently on going
    if (
      nextstatus === ElectionStatus.PAUSED &&
      currentstatus !== ElectionStatus.ONGOING
    ) {
      throw new BadRequestException('Only Ongoin elections cand be paused  ');
    }

    // Rule 3cannot start of it is already on going
    if (
      nextstatus === ElectionStatus.ONGOING &&
      currentstatus === ElectionStatus.ONGOING
    ) {
      return election;
    }

    return this.prismaservice.election.update({
      where: { id: electionid },
      data: {
        status: nextstatus,
        // Only set startDate if it's going ONGOING for the FIRST time
        ...(nextstatus === ElectionStatus.ONGOING &&
          !election.startDate && { startDate: new Date() }),
        ...(nextstatus === ElectionStatus.COMPLETED && { endDate: new Date() }),
      },
    });
  }
}
