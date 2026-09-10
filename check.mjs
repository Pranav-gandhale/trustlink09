import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: 'gandhalepranav009@gmail.com' } });
console.log(user);
await prisma.$disconnect();
