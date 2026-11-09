import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  if (!handle || handle.toLowerCase() === "admin") {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({
    handle,
    avatar: "😎",
    bio: "SinopCepte sakini",
    instagram: handle,
    createdAt: new Date().toISOString(),
    badges: [],
  });
}
