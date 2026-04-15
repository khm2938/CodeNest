import type { PageRepository } from "@/features/storage/page-repository";
import type { CreatePageInput, UpdatePageInput } from "@/features/storage/page-repository";
import { createPrismaPageRepository } from "./prisma-page-repository";

let repository: PageRepository = createPrismaPageRepository();

export function setPageStoreRepositoryForTest(nextRepository: PageRepository) {
  repository = nextRepository;
}

export async function listPages() {
  return repository.listPages();
}

export async function getPage(pageId: string) {
  return repository.getPage(pageId);
}

export async function createPage(title?: string, blocks?: CreatePageInput["blocks"]) {
  return repository.createPage({
    title,
    blocks,
  });
}

export async function updatePage(pageId: string, updates: UpdatePageInput) {
  return repository.updatePage(pageId, updates);
}

export async function deletePage(pageId: string) {
  return repository.deletePage(pageId);
}

export async function reorderBlocks(pageId: string, blockIds: string[]) {
  return repository.reorderBlocks(pageId, blockIds);
}
