import type { Block, PageItem } from "../pages/pages";

export function cloneBlock(block: Block): Block {
  return { ...block };
}

export function clonePage(page: PageItem): PageItem {
  return {
    ...page,
    blocks: page.blocks.map(cloneBlock),
  };
}

export function clonePages(pages: PageItem[]): PageItem[] {
  return pages.map(clonePage);
}
