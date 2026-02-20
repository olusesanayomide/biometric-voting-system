import { PrismaClient, UserType, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// 1. Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

// 2. Setup the Adapter (Same as your PrismaService)
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  console.log(' Seeding database...');

  // 1. Create a Test Voter
  const voter = await prisma.user.upsert({
    where: { identificationNumber: '22/0000' },
    update: {},
    create: {
      email: 'voter@university.edu',
      identificationNumber: '22/0000',
      name: 'Test Student',
      userType: UserType.STUDENT, // Match your Enum
      role: Role.VOTER,
    },
  });

  // 2. Create an Admin (to access Admin routes)
  const admin = await prisma.user.upsert({
    where: { identificationNumber: 'ADMIN-001' },
    update: {},
    create: {
      email: 'admin@university.edu',
      identificationNumber: 'ADMIN-001',
      name: 'System Administrator',
      userType: UserType.STAFF,
      role: Role.ADMIN,
    },
  });

  console.log(`Seeded: Voter ID ${voter.id}, Admin ID ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
