import { getInitialPages, type Block, type PageItem } from "../pages/pages";
import type { CreatePageInput, PageRepository, UpdatePageInput } from "./page-repository";

type PageIndex = {
  order: string[];
};

const STORAGE_PREFIX = "codenest";
const PAGE_INDEX_KEY = `${STORAGE_PREFIX}:page-index`;

function createTextBlock(): Block {
  return {
    id: `block-${crypto.randomUUID()}`,
    type: "text",
    text: "",
  };
}

function cloneBlock(block: Block): Block {
  return { ...block };
}

function clonePage(page: PageItem): PageItem {
  return {
    ...page,
    blocks: page.blocks.map(cloneBlock),
  };
}

function clonePages(pages: PageItem[]): PageItem[] {
  return pages.map(clonePage);
}

function pageKey(pageId: string) {
  return `${STORAGE_PREFIX}:page:${pageId}`;
}

function readJSON<T>(key: string): T | null {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readPageIndex(): PageIndex | null {
  return readJSON<PageIndex>(PAGE_INDEX_KEY);
}

function writePageIndex(index: PageIndex) {
  writeJSON(PAGE_INDEX_KEY, index);
}

function readPage(pageId: string): PageItem | null {
  return readJSON<PageItem>(pageKey(pageId));
}

function writePage(page: PageItem) {
  writeJSON(pageKey(page.id), page);
}

function removePage(pageId: string) {
  localStorage.removeItem(pageKey(pageId));
}

function createDefaultPage(): PageItem {
  return {
    id: `page-${crypto.randomUUID()}`,
    title: "제목 없음",
    blocks: [createTextBlock()],
    updatedAt: "방금 전",
  };
}

function createSeedIndex(initialPages: PageItem[]): PageIndex {
  return {
    order: initialPages.map((page) => page.id),
  };
}

function seedStorage(initialPages: PageItem[]) {
  const seededPages = clonePages(initialPages);

  for (const page of seededPages) {
    writePage(page);
  }

  writePageIndex(createSeedIndex(seededPages));
}

function ensureSeeded(initialPages: PageItem[]) {
  if (readPageIndex()) {
    return;
  }

  seedStorage(initialPages);
}

function loadOrderedPages(index: PageIndex): PageItem[] {
  const pages: PageItem[] = [];

  for (const pageId of index.order) {
    const page = readPage(pageId);

    if (page) {
      pages.push(clonePage(page));
    }
  }

  return pages;
}

function savePageAndIndex(page: PageItem, index: PageIndex) {
  writePage(page);
  writePageIndex(index);
}

function updatePageBlockOrder(page: PageItem, blockIds: string[]): PageItem {
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

export function createLocalStoragePageRepository(
  initialPages: PageItem[] = getInitialPages(),
): PageRepository {
  return {
    async listPages() {
      ensureSeeded(initialPages);
      const index = readPageIndex();

      if (!index) {
        return clonePages(initialPages);
      }

      return loadOrderedPages(index);
    },

    async getPage(pageId: string) {
      ensureSeeded(initialPages);
      const page = readPage(pageId);
      return page ? clonePage(page) : null;
    },

    async createPage(input: CreatePageInput = {}) {
      ensureSeeded(initialPages);
      const defaultPage = createDefaultPage();
      const nextPage: PageItem = {
        ...defaultPage,
        title: input.title ?? defaultPage.title,
        blocks: input.blocks ? input.blocks.map(cloneBlock) : defaultPage.blocks,
      };

      const index = readPageIndex() ?? createSeedIndex(initialPages);
      const nextIndex: PageIndex = {
        order: [nextPage.id, ...index.order.filter((pageId) => pageId !== nextPage.id)],
      };

      savePageAndIndex(nextPage, nextIndex);
      return clonePage(nextPage);
    },

    async updatePage(pageId: string, updates: UpdatePageInput) {
      ensureSeeded(initialPages);
      const currentPage = readPage(pageId);

      if (!currentPage) {
        return null;
      }

      const nextPage: PageItem = {
        ...currentPage,
        ...updates,
        updatedAt: "방금 전",
        blocks: updates.blocks ? updates.blocks.map(cloneBlock) : currentPage.blocks.map(cloneBlock),
      };

      writePage(nextPage);
      return clonePage(nextPage);
    },

    async deletePage(pageId: string) {
      ensureSeeded(initialPages);
      const index = readPageIndex();
      const currentPage = readPage(pageId);

      if (!index || !currentPage) {
        return false;
      }

      removePage(pageId);
      writePageIndex({
        order: index.order.filter((currentPageId) => currentPageId !== pageId),
      });

      return true;
    },

    async reorderBlocks(pageId: string, blockIds: string[]) {
      ensureSeeded(initialPages);
      const currentPage = readPage(pageId);

      if (!currentPage) {
        return null;
      }

      const reorderedPage = updatePageBlockOrder(currentPage, blockIds);
      writePage(reorderedPage);

      return clonePage(reorderedPage);
    },
  };
}
