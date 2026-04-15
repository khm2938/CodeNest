import type { Block, PageItem } from "../pages/pages";

export function createTextBlock(): Block {
  return {
    id: `block-${crypto.randomUUID()}`,
    type: "text",
    text: "",
  };
}

export function createDefaultPage(): PageItem {
  return {
    id: `page-${crypto.randomUUID()}`,
    title: "제목 없음",
    blocks: [createTextBlock()],
    updatedAt: "방금 전",
  };
}
