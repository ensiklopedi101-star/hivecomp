import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSchema } from "@/db/ensure";
import { articles } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { CATEGORIES } from "@/lib/content";

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const title = clean(body.title);
    const category = clean(body.category);
    const excerpt = clean(body.excerpt);
    const imageUrl = clean(body.imageUrl);
    const source = clean(body.source) || "Portal-Hub";

    if (!title || !excerpt || !(CATEGORIES as readonly string[]).includes(category)) {
      return NextResponse.json(
        { ok: false, error: "Judul, kategori, dan ringkasan wajib diisi." },
        { status: 400 },
      );
    }
    if (title.length > 220 || excerpt.length > 600 || imageUrl.length > 600) {
      return NextResponse.json({ ok: false, error: "Input terlalu panjang." }, { status: 400 });
    }
    if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
      return NextResponse.json({ ok: false, error: "URL gambar harus diawali http(s)." }, { status: 400 });
    }

    await ensureSchema();
    await db.insert(articles).values({ title, category, excerpt, imageUrl, source });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal menyimpan artikel." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Tidak diizinkan." }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID tidak valid." }, { status: 400 });
  }
  try {
    await ensureSchema();
    await db.delete(articles).where(eq(articles.id, id));
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal menghapus." }, { status: 500 });
  }
}
