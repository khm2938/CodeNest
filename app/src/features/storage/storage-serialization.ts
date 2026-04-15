import type { PageItem } from "../pages/pages";
import { cloneBlock, clonePage } from "./page-clone";
import type { PageIndex } from "./page-index";

const CURRENT_SCHEMA_VERSION = 1;

type StoredSchema = {
  schemaVersion?: number;
};

type StoredPageIndex = StoredSchema & PageIndex;
type StoredPage = StoredSchema &
  PageItem;

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

function normalizePageIndex(value: StoredPageIndex | null): PageIndex | null {
  if (!value || !Array.isArray(value.order)) {
    return null;
  }

  return {
    order: [...value.order],
  };
}

function normalizePage(value: StoredPage | null): PageItem | null {
  if (!value || typeof value.id !== "string" || typeof value.title !== "string" || !Array.isArray(value.blocks)) {
    return null;
  }

  return clonePage({
    id: value.id,
    title: value.title,
    blocks: value.blocks.map(cloneBlock),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "방금 전",
  });
}

export function readStoredPageIndex(key: string): PageIndex | null {
  return normalizePageIndex(readJSON<StoredPageIndex>(key));
}

export function writeStoredPageIndex(key: string, index: PageIndex) {
  writeJSON(key, {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ...index,
  });
}

export function readStoredPage(key: string): PageItem | null {
  return normalizePage(readJSON<StoredPage>(key));
}

export function writeStoredPage(key: string, page: PageItem) {
  writeJSON(key, {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ...page,
  });
}
