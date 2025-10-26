import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth";
import { prisma } from "@/lib/backend/prisma";
import { OneDriveService } from "@/lib/backend/services/onedriveService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an attorney
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAttorney = currentUser.role === "ATTORNEY";

    if (!isAttorney) {
      return NextResponse.json(
        { error: "Access denied. Attorney access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || "root";
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const search = searchParams.get("search");
    const orderBy = searchParams.get("orderBy") || "name";

    const oneDriveService = new OneDriveService(request.cookies);
    const result = await oneDriveService.listFiles(folderId, {
      pageSize,
      search: search || undefined,
      orderBy,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to list files" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      files: result.files,
      total: result.total,
    });
  } catch (error) {
    console.error("OneDrive API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to list files",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an attorney
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAttorney = currentUser.role === "ATTORNEY";

    if (!isAttorney) {
      return NextResponse.json(
        { error: "Access denied. Attorney access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const oneDriveService = new OneDriveService(request.cookies);
    const result = await oneDriveService.downloadFile(fileId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to download file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ file: result.file });
  } catch (error) {
    console.error("OneDrive download error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to download file",
      },
      { status: 500 }
    );
  }
}
