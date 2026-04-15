import { NextResponse } from "next/server";
import type { PageItem } from "@/features/pages/pages";
import { deletePage, getPage, updatePage } from "@/server/pages/page-store";

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const page = getPage(pageId);

  if (!page) {
    return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const body = (await request.json().catch(() => null)) as { title?: string; blocks?: unknown } | null;

  if (!body) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const page = updatePage(pageId, {
    title: typeof body.title === "string" ? body.title : undefined,
    blocks: Array.isArray(body.blocks) ? (body.blocks as PageItem["blocks"]) : undefined,
  });

  if (!page) {
    return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const removed = deletePage(pageId);

  if (!removed) {
    return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
