import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = body.username || "misafir";
    const isAdmin = username.toLowerCase() === "admin";
    const user = {
      username,
      handle: username,
      avatar: isAdmin ? "👑" : "😎",
      roles: isAdmin ? ["ADMIN", "ROLE_ADMIN", "USER"] : ["USER"],
    };

    const res = NextResponse.json(user);
    res.cookies.set("JSESSIONID", "mock-session-" + Date.now(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Giriş başarısız" }, { status: 400 });
  }
}
