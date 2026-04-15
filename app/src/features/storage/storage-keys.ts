const STORAGE_PREFIX = "codenest";

export const PAGE_INDEX_KEY = `${STORAGE_PREFIX}:page-index`;

export function createPageKey(pageId: string) {
  return `${STORAGE_PREFIX}:page:${pageId}`;
}
