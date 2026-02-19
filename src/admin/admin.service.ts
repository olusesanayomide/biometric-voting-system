import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async addCandidate(dto: CreateCandidateDto) {
    // 1. First Principle: Ensure the Election exists and is still in 'UPCOMING'
    const election = await this.prisma.election.findUnique({
      where: { id: dto.electionId },
      include: { positions: true },
    });

    if (!election) throw new NotFoundException('Election not found');

    if (election.status !== 'DRAFT') {
      throw new BadRequestException(
        'Cannot add candidates once an election is ongoing or closed.',
      );
    }

    // 2. Validate the Position exists and belongs to this election
    const positionExists = election.positions.find(
      (p) => p.id === dto.positionId,
    );
    if (!positionExists) {
      throw new BadRequestException(
        'The specified position does not exist in this election.',
      );
    }

    // 3. Create the Candidate
    return this.prisma.candidate.create({
      data: {
        name: dto.name,
        manifesto: dto.manifesto,
        imageUrl: dto.imageUrl,
        positionId: dto.positionId,
        electionId: dto.electionId,
      },
    });
  }

  async removeCandidate(id: string) {
    // 1. Fetch the candidate and include the count of ballots (votes)
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ballots: true }, // Efficiently get just the number of votes
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found.');
    }

    // 2. The Integrity Check
    if (candidate._count.ballots > 0) {
      throw new BadRequestException(
        `Cannot delete candidate "${candidate.name}" because votes have already been cast for them. Consider pausing the election instead.`,
      );
    }

    const election = await this.prisma.election.findUnique({
      where: { id: candidate.electionId },
    });
    if (!election) {
      throw new NotFoundException(
        `Election with ID ${candidate.electionId} not found.`,
      );
    }

    if (election.status === 'ONGOING') {
      throw new BadRequestException(
        'Cannot remove candidates while an election is active.',
      );
    }
    // 3. Safe to delete
    return this.prisma.candidate.delete({
      where: { id },
    });
  }
}
