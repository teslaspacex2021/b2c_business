import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@b2bbusiness.com',
    password: 'password',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    name: 'Editor User',
    email: 'editor@b2bbusiness.com',
    password: 'password',
    role: 'EDITOR',
    status: 'ACTIVE',
  },
  {
    name: 'Test User 1',
    email: 'user1@example.com',
    password: 'password',
    role: 'USER',
    status: 'ACTIVE',
  },
  {
    name: 'Test User 2',
    email: 'user2@example.com',
    password: 'password',
    role: 'USER',
    status: 'ACTIVE',
  },
  {
    name: 'Inactive User',
    email: 'inactive@example.com',
    password: 'password',
    role: 'USER',
    status: 'INACTIVE',
  },
];

async function seedUsers() {
  console.log('开始创建测试用户...');

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: hashedPassword,
        role: userData.role as any,
        status: userData.status as any,
      },
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role as any,
        status: userData.status as any,
      },
    });
    
    console.log(`✓ 创建/更新用户: ${userData.name} (${userData.email}) - ${userData.role}`);
  }

  console.log('测试用户创建完成！');
}

export { seedUsers };

if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
