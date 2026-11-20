import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const isHttps =
    forwardedProto === "https" || req.url.startsWith("https://");

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
    path: "/",
    maxAge: 0,
  });
  return res;
}
