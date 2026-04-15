import { getInitialPages, type PageItem } from "../pages/pages";
import { cloneBlock, clonePage, clonePages } from "./page-clone";
import { createDefaultPage } from "./page-factory";
import { createPageIndex, prependPageId, removePageId, type PageIndex } from "./page-index";
import { reorderBlocksInPage } from "./page-order";
import { createPageKey, PAGE_INDEX_KEY } from "./storage-keys";
import {
  readStoredPage,
  readStoredPageIndex,
  writeStoredPage,
  writeStoredPageIndex,
} from "./storage-serialization";
import type { CreatePageInput, PageRepository, UpdatePageInput } from "./page-repository";

function seedStorage(initialPages: PageItem[]) {
  const seededPages = clonePages(initialPages);

  for (const page of seededPages) {
    writeStoredPage(createPageKey(page.id), page);
  }

  writeStoredPageIndex(PAGE_INDEX_KEY, createPageIndex(seededPages.map((page) => page.id)));
}

function ensureSeeded(initialPages: PageItem[]) {
  if (readStoredPageIndex(PAGE_INDEX_KEY)) {
    return;
  }

  seedStorage(initialPages);
}

function loadOrderedPages(index: PageIndex): PageItem[] {
  const pages: PageItem[] = [];

  for (const pageId of index.order) {
    const page = readStoredPage(createPageKey(pageId));

    if (page) {
      pages.push(clonePage(page));
    }
  }

  return pages;
}

function savePageAndIndex(page: PageItem, index: PageIndex) {
  writeStoredPage(createPageKey(page.id), page);
  writeStoredPageIndex(PAGE_INDEX_KEY, index);
}

export function createLocalStoragePageRepository(
  initialPages: PageItem[] = getInitialPages(),
): PageRepository {
  return {
    async listPages() {
      ensureSeeded(initialPages);
      const index = readStoredPageIndex(PAGE_INDEX_KEY);

      if (!index) {
        return clonePages(initialPages);
      }

      return loadOrderedPages(index);
    },

    async getPage(pageId: string) {
      ensureSeeded(initialPages);
      const page = readStoredPage(createPageKey(pageId));
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

      const index = readStoredPageIndex(PAGE_INDEX_KEY) ?? createPageIndex(initialPages.map((page) => page.id));
      const nextIndex: PageIndex = prependPageId(index, nextPage.id);

      savePageAndIndex(nextPage, nextIndex);
      return clonePage(nextPage);
    },

    async updatePage(pageId: string, updates: UpdatePageInput) {
      ensureSeeded(initialPages);
      const currentPage = readStoredPage(createPageKey(pageId));

      if (!currentPage) {
        return null;
      }

      const nextPage: PageItem = {
        ...currentPage,
        ...updates,
        updatedAt: "방금 전",
        blocks: updates.blocks ? updates.blocks.map(cloneBlock) : currentPage.blocks.map(cloneBlock),
      };

      writeStoredPage(createPageKey(pageId), nextPage);
      return clonePage(nextPage);
    },

    async deletePage(pageId: string) {
      ensureSeeded(initialPages);
      const index = readStoredPageIndex(PAGE_INDEX_KEY);
      const currentPage = readStoredPage(createPageKey(pageId));

      if (!index || !currentPage) {
        return false;
      }

      localStorage.removeItem(createPageKey(pageId));
      writeStoredPageIndex(PAGE_INDEX_KEY, removePageId(index, pageId));

      return true;
    },

    async reorderBlocks(pageId: string, blockIds: string[]) {
      ensureSeeded(initialPages);
      const currentPage = readStoredPage(createPageKey(pageId));

      if (!currentPage) {
        return null;
      }

      const nextPage = reorderBlocksInPage(currentPage, blockIds);

      writeStoredPage(createPageKey(pageId), nextPage);

      return clonePage(nextPage);
    },
  };
}
