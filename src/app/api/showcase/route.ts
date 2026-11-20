import { NextResponse } from "next/server";
import { getShowcaseData } from "@/lib/showcase";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getShowcaseData();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
