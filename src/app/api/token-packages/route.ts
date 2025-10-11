import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const packages = await prisma.tokenPackage.findMany({
      where: { isActive: true },
      orderBy: { priceInCents: 'asc' },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Error fetching token packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token packages' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || (session.user.role !== 'ATTORNEY' && session.user.role !== 'LAWYER')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { name, tokens, priceInCents, description } = await req.json();

    if (!name || !tokens || !priceInCents) {
      return NextResponse.json(
        { error: 'Name, tokens, and price are required' },
        { status: 400 }
      );
    }

    const tokenPackage = await prisma.tokenPackage.create({
      data: {
        name,
        tokens,
        priceInCents,
        description,
      },
    });

    return NextResponse.json({ package: tokenPackage });
  } catch (error) {
    console.error('Error creating token package:', error);
    return NextResponse.json(
      { error: 'Failed to create token package' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
