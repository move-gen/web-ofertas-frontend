const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.offer.deleteMany();
  await prisma.image.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data.');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create sample cars according to the new schema
  const cars = [
    { name: 'Toyota Camry 2023', sku: 'TOY-CAM-23', regularPrice: 25000 },
    { name: 'Honda Civic 2022', sku: 'HON-CIV-22', regularPrice: 22000 },
    { name: 'Ford Mustang 2024', sku: 'FOR-MUS-24', regularPrice: 40000 },
  ];

  for (const carData of cars) {
    await prisma.car.create({ data: carData });
  }
  console.log(`Created ${cars.length} sample cars.`);

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