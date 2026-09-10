import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      serviceType: true,
      isVerified: true
    }
  });
  console.log(JSON.stringify(providers, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
