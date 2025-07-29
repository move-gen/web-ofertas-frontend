const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  // We only need to ensure the admin user exists.
  // We clear users only to avoid conflicts on re-seeding.
  await prisma.user.deleteMany().catch(() => {}); // Ignore errors if table is empty

  const hashedPassword = await bcrypt.hash('password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });
  console.log(`Ensured admin user exists: admin@example.com`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 