import 'dotenv/config';
import prisma from './config/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("123456", salt);

  const agent = await prisma.agent.upsert({
    where: { email: "agent@example.com" },
    update: { password: hashedPassword, fullName: "Selam Fikru", role: "agent" },
    create: {
      fullName: "Selam Fikru",
      email: "agent@example.com",
      password: hashedPassword,
      role: "agent",
    },
  });

  console.log('Demo agent ready:', agent.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
