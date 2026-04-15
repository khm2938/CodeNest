export type PageIndex = {
  order: string[];
};

export function createPageIndex(pageIds: string[]): PageIndex {
  return {
    order: [...pageIds],
  };
}

export function prependPageId(index: PageIndex, pageId: string): PageIndex {
  return {
    order: [pageId, ...index.order.filter((currentPageId) => currentPageId !== pageId)],
  };
}

export function removePageId(index: PageIndex, pageId: string): PageIndex {
  return {
    order: index.order.filter((currentPageId) => currentPageId !== pageId),
  };
}
