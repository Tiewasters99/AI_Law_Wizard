const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@aiwizard.com' }
    });

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name: 'System Administrator',
        email: 'admin@aiwizard.com',
        password: hashedPassword,
        isSuperAdmin: true,
        isActive: true,
      }
    });

    console.log('Admin created successfully:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
    });

    // Create some sample activity logs
    await prisma.adminActivityLog.createMany({
      data: [
        {
          adminId: admin.id,
          action: 'LOGIN',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        {
          adminId: admin.id,
          action: 'USER_CREATED',
          targetType: 'User',
          targetId: 'sample-user-1',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        {
          adminId: admin.id,
          action: 'FEATURE_TOGGLED',
          targetType: 'Feature',
          targetId: 'attorney_wizard',
          details: { enabled: true },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        {
          adminId: admin.id,
          action: 'PACKAGE_CREATED',
          targetType: 'TokenPackage',
          targetId: 'basic-plan',
          details: { name: 'Basic Plan', tokens: 1000 },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        {
          adminId: admin.id,
          action: 'LOGIN_FAILED',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        },
      ]
    });

    console.log('Sample activity logs created successfully');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
