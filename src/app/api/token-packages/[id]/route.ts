import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || (session.user.role !== 'ATTORNEY' && session.user.role !== 'LAWYER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { isActive } = await req.json();
    const { id } = await params;

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
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || (session.user.role !== 'ATTORNEY' && session.user.role !== 'LAWYER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

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
  }
}
