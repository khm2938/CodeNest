import { NextResponse } from "next/server";
import { reorderBlocks } from "@/server/pages/page-store";

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { pageId } = await context.params;
  const body = (await request.json().catch(() => null)) as { blockIds?: unknown } | null;

  if (!body || !Array.isArray(body.blockIds)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const page = reorderBlocks(pageId, body.blockIds.filter((blockId): blockId is string => typeof blockId === "string"));

  if (!page) {
    return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(page);
}
