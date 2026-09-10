const { PrismaClient } = require("@prisma/client");

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: node scripts/reset-password.cjs <email> <newPassword>");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { password: newPassword },
  });

  console.log("Password updated for", email, "role:", user.role);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

