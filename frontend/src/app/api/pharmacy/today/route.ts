import { NextResponse } from "next/server";
import pharmacy from "@/data/pharmacy.json";

export async function GET() {
  return NextResponse.json(pharmacy);
}
