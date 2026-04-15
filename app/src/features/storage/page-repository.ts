import { getInitialPages, type Block, type PageItem } from "../pages/pages";
import { cloneBlock, clonePage, clonePages } from "./page-clone";
import { createDefaultPage } from "./page-factory";
import { reorderBlocksInPage } from "./page-order";

export type CreatePageInput = {
  title?: string;
  blocks?: Block[];
};

export type UpdatePageInput = Partial<Pick<PageItem, "title" | "blocks">>;

export interface PageRepository {
  listPages(): Promise<PageItem[]>;
  getPage(pageId: string): Promise<PageItem | null>;
  createPage(input?: CreatePageInput): Promise<PageItem>;
  updatePage(pageId: string, updates: UpdatePageInput): Promise<PageItem | null>;
  deletePage(pageId: string): Promise<boolean>;
  reorderBlocks(pageId: string, blockIds: string[]): Promise<PageItem | null>;
}

function updatePageInMemory(pages: PageItem[], pageId: string, updates: UpdatePageInput): PageItem[] {
  return pages.map((page) => {
    if (page.id !== pageId) {
      return page;
    }

    return {
      ...page,
      ...updates,
      updatedAt: "방금 전",
      blocks: updates.blocks ? updates.blocks.map(cloneBlock) : page.blocks.map(cloneBlock),
    };
  });
}

export function createInMemoryPageRepository(initialPages: PageItem[] = getInitialPages()): PageRepository {
  let pages = clonePages(initialPages);

  return {
    async listPages() {
      return clonePages(pages);
    },

    async getPage(pageId: string) {
      const page = pages.find((currentPage) => currentPage.id === pageId);
      return page ? clonePage(page) : null;
    },

    async createPage(input: CreatePageInput = {}) {
      const defaultPage = createDefaultPage();
      const newPage: PageItem = {
        ...defaultPage,
        title: input.title ?? defaultPage.title,
        blocks: input.blocks ? input.blocks.map(cloneBlock) : defaultPage.blocks,
      };

      pages = [newPage, ...pages];
      return clonePage(newPage);
    },

    async updatePage(pageId: string, updates: UpdatePageInput) {
      const nextPages = updatePageInMemory(pages, pageId, updates);
      const nextPage = nextPages.find((page) => page.id === pageId) ?? null;

      pages = nextPages;
      return nextPage ? clonePage(nextPage) : null;
    },

    async deletePage(pageId: string) {
      const nextPages = pages.filter((page) => page.id !== pageId);
      const removed = nextPages.length !== pages.length;

      pages = nextPages;
      return removed;
    },

    async reorderBlocks(pageId: string, blockIds: string[]) {
      const targetPage = pages.find((page) => page.id === pageId);

      if (!targetPage) {
        return null;
      }

      const reorderedPage = reorderBlocksInPage(targetPage, blockIds);
      pages = pages.map((page) => (page.id === pageId ? reorderedPage : page));

      return clonePage(reorderedPage);
    },
  };
}
