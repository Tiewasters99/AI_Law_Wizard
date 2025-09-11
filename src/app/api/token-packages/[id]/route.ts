import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { isActive } = await req.json();
    const { id } = params;

    const tokenPackage = await prisma.tokenPackage.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ package: tokenPackage });
  } catch (error) {
    console.error('Error updating token package:', error);
    return NextResponse.json(
      { error: 'Failed to update token package' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    await prisma.tokenPackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting token package:', error);
    return NextResponse.json(
      { error: 'Failed to delete token package' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
