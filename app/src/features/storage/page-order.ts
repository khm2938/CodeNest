import type { Block, PageItem } from "../pages/pages";
import { cloneBlock } from "./page-clone";

export function reorderBlocksInPage(page: PageItem, blockIds: string[]): PageItem {
  const blockById = new Map(page.blocks.map((block) => [block.id, cloneBlock(block)]));
  const reorderedBlocks: Block[] = [];

  for (const blockId of blockIds) {
    const block = blockById.get(blockId);

    if (!block) {
      continue;
    }

    reorderedBlocks.push(block);
    blockById.delete(blockId);
  }

  for (const block of page.blocks) {
    if (blockById.has(block.id)) {
      reorderedBlocks.push(cloneBlock(block));
      blockById.delete(block.id);
    }
  }

  return {
    ...page,
    blocks: reorderedBlocks,
    updatedAt: "방금 전",
  };
}
