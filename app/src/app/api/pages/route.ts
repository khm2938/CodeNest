import { NextResponse } from "next/server";
import type { PageItem } from "@/features/pages/pages";
import { createPage, listPages } from "@/server/pages/page-store";

export async function GET() {
  return NextResponse.json(await listPages());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { title?: string; blocks?: unknown } | null;

  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const page = createPage(
    typeof body.title === "string" ? body.title : undefined,
    Array.isArray(body.blocks) ? (body.blocks as PageItem["blocks"]) : undefined,
  );

  return NextResponse.json(page, { status: 201 });
}
