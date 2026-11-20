import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, sessionToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`admin-login:${ip}`, 6, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Terlalu banyak percobaan login. Coba lagi dalam ${rate.retryAfterSec} detik.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        },
      );
    }

    const body = (await req.json()) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !checkPassword(password)) {
      return NextResponse.json(
        { ok: false, error: "Password salah." },
        { status: 401 },
      );
    }

    const forwardedProto = req.headers.get("x-forwarded-proto");
    const isHttps =
      forwardedProto === "https" || req.url.startsWith("https://");

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, sessionToken(), {
      httpOnly: true,
      // Use SameSite=None when served over HTTPS so login also works inside cross-origin preview iframes
      sameSite: isHttps ? "none" : "lax",
      secure: isHttps,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }
}
