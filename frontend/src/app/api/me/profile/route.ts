import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    handle: "aykut_57",
    email: "aykut@sinopcepte.com",
    avatar: "😎",
    bio: "Sinop sevdalısı & SinopCepte kullanıcısı",
    instagram: "aykutyesil",
    checkinVisibility: "PUBLIC",
    anonymousMode: false,
    createdAt: new Date().toISOString(),
    roles: ["USER"],
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({
    handle: "aykut_57",
    email: "aykut@sinopcepte.com",
    avatar: body.avatar || "😎",
    bio: body.bio || "",
    instagram: body.instagram || "",
    checkinVisibility: body.checkinVisibility || "PUBLIC",
    anonymousMode: Boolean(body.anonymousMode),
    createdAt: new Date().toISOString(),
    roles: ["USER"],
  });
}
