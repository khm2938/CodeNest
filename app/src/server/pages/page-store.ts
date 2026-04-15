import { getInitialPages, type PageItem } from "@/features/pages/pages";
import { cloneBlock, clonePage, clonePages } from "@/features/storage/page-clone";
import { createDefaultPage } from "@/features/storage/page-factory";
import { createPageIndex, prependPageId, removePageId, type PageIndex } from "@/features/storage/page-index";
import { reorderBlocksInPage } from "@/features/storage/page-order";

let pages: PageItem[] = clonePages(getInitialPages());
let pageIndex: PageIndex = createPageIndex(pages.map((page) => page.id));

function syncIndex() {
  pageIndex = createPageIndex(pages.map((page) => page.id));
}

export function resetPageStore(initialPages: PageItem[] = getInitialPages()) {
  pages = clonePages(initialPages);
  pageIndex = createPageIndex(pages.map((page) => page.id));
}

export function listPages() {
  return clonePages(pageIndex.order.map((pageId) => pages.find((page) => page.id === pageId)).filter(Boolean) as PageItem[]);
}

export function getPage(pageId: string) {
  const page = pages.find((currentPage) => currentPage.id === pageId);
  return page ? clonePage(page) : null;
}

export function createPage(title?: string, blocks?: PageItem["blocks"]) {
  const defaultPage = createDefaultPage();
  const nextPage: PageItem = {
    ...defaultPage,
    title: title ?? defaultPage.title,
    blocks: blocks ? blocks.map(cloneBlock) : defaultPage.blocks,
  };

  pages = [nextPage, ...pages];
  pageIndex = prependPageId(pageIndex, nextPage.id);

  return clonePage(nextPage);
}

export function updatePage(pageId: string, updates: Partial<Pick<PageItem, "title" | "blocks">>) {
  const currentPage = pages.find((page) => page.id === pageId);

  if (!currentPage) {
    return null;
  }

  const nextPage: PageItem = {
    ...currentPage,
    ...updates,
    updatedAt: "방금 전",
    blocks: updates.blocks ? updates.blocks.map(cloneBlock) : currentPage.blocks.map(cloneBlock),
  };

  pages = pages.map((page) => (page.id === pageId ? nextPage : page));

  return clonePage(nextPage);
}

export function deletePage(pageId: string) {
  const currentPage = pages.find((page) => page.id === pageId);

  if (!currentPage) {
    return false;
  }

  pages = pages.filter((page) => page.id !== pageId);
  pageIndex = removePageId(pageIndex, pageId);
  return true;
}

export function reorderBlocks(pageId: string, blockIds: string[]) {
  const currentPage = pages.find((page) => page.id === pageId);

  if (!currentPage) {
    return null;
  }

  const nextPage = reorderBlocksInPage(currentPage, blockIds);
  pages = pages.map((page) => (page.id === pageId ? nextPage : page));
  syncIndex();

  return clonePage(nextPage);
}
