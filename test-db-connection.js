const { PrismaClient } = require('./src/generated/prisma');

async function testConnection() {
  console.log('Testing database connection...');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Try to count users
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in database`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
