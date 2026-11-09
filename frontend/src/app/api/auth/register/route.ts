import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const handle = (body.handle || "kullanici").trim();
    const user = {
      username: handle,
      handle,
      roles: ["USER"],
      avatar: "😎",
    };

    const res = NextResponse.json(user, { status: 201 });
    res.cookies.set("JSESSIONID", "mock-session-" + Date.now(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    res.cookies.set("SINOPCEPTE_USER", handle, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Kayıt başarısız" }, { status: 400 });
  }
}
