import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("JSESSIONID");
  const userCookie = req.cookies.get("SINOPCEPTE_USER");

  if (!session && !userCookie) {
    return new NextResponse(null, { status: 401 });
  }

  const handle = userCookie?.value || "aykut_57";
  const isAdmin = handle.toLowerCase() === "admin";

  return NextResponse.json({
    username: handle,
    handle,
    roles: isAdmin ? ["ADMIN", "ROLE_ADMIN", "USER"] : ["USER"],
    avatar: isAdmin ? "👑" : "😎",
  });
}
