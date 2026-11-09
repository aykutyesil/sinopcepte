import { NextResponse } from "next/server";

export async function GET() {
  const token = "mock-csrf-" + Math.random().toString(36).substring(2);
  const response = NextResponse.json({ token, parameterName: "_csrf", headerName: "X-XSRF-TOKEN" });
  response.cookies.set("XSRF-TOKEN", token, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  return response;
}
