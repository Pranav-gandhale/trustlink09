const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, name: true, role: true },
  });
  console.log(JSON.stringify(admins, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

