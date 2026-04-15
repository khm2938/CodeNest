import { Prisma } from "@prisma/client";
import type { PageItem } from "@/features/pages/pages";
import { getInitialPages } from "@/features/pages/pages";
import { cloneBlock, clonePage, clonePages } from "@/features/storage/page-clone";
import { createDefaultPage } from "@/features/storage/page-factory";
import { prisma } from "@/server/db/prisma";
import type { CreatePageInput, PageRepository, UpdatePageInput } from "@/features/storage/page-repository";

const SCHEMA_INIT_SQL = [
  `CREATE TABLE IF NOT EXISTS "pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME
  )`,
  `CREATE TABLE IF NOT EXISTS "blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "checked" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT,
    "position" INTEGER NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    CONSTRAINT "blocks_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "blocks_page_id_position_key" ON "blocks" ("page_id", "position")`,
  `CREATE INDEX IF NOT EXISTS "blocks_page_id_position_idx" ON "blocks" ("page_id", "position")`,
];

type PrismaPage = Prisma.PageGetPayload<{
  include: {
    blocks: true;
  };
}>;

let bootstrapPromise: Promise<void> | null = null;

function formatUpdatedAt(updatedAt: Date) {
  const ageInMs = Date.now() - updatedAt.getTime();

  if (ageInMs < 24 * 60 * 60 * 1000) {
    return "방금 전";
  }

  return updatedAt.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function toPageItem(page: PrismaPage): PageItem {
  return {
    id: page.id,
    title: page.title,
    blocks: page.blocks
      .filter((block) => block.deletedAt === null)
      .sort((left, right) => left.position - right.position)
      .map((block) => cloneBlock({
        id: block.id,
        type: block.type as PageItem["blocks"][number]["type"],
        text: block.text,
        checked: block.checked,
        language: block.language ?? undefined,
      })),
    updatedAt: formatUpdatedAt(page.updatedAt),
  };
}

function toBlockCreateInput(block: PageItem["blocks"][number], position: number) {
  return {
    id: block.id,
    type: block.type,
    text: block.text,
    checked: block.checked ?? false,
    language: block.language ?? null,
    position,
    schemaVersion: 1,
  };
}

function toBlockCreateManyInput(pageId: string, block: PageItem["blocks"][number], position: number) {
  return {
    ...toBlockCreateInput(block, position),
    pageId,
  };
}

async function ensureSchema() {
  for (const statement of SCHEMA_INIT_SQL) {
    await prisma.$executeRawUnsafe(statement);
  }
}

async function seedInitialPages() {
  const seedPages = clonePages(getInitialPages());

  for (let index = 0; index < seedPages.length; index += 1) {
    const page = seedPages[index];

    await prisma.page.create({
      data: {
        id: page.id,
        title: page.title,
        sortOrder: index,
        schemaVersion: 1,
        blocks: {
          create: page.blocks.map((block, blockIndex) => toBlockCreateInput(block, blockIndex)),
        },
      },
    });
  }
}

async function bootstrapDatabase() {
  await ensureSchema();
  const pageCount = await prisma.page.count({
    where: {
      deletedAt: null,
    },
  });

  if (pageCount === 0) {
    await seedInitialPages();
  }
}

async function ensureBootstrapped() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapDatabase();
  }

  await bootstrapPromise;
}

async function fetchPage(pageId: string) {
  return prisma.page.findUnique({
    where: {
      id: pageId,
    },
    include: {
      blocks: true,
    },
  });
}

async function fetchPages() {
  return prisma.page.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      blocks: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });
}

export async function resetPrismaPageRepository(initialPages: PageItem[] = getInitialPages()) {
  bootstrapPromise = null;
  await ensureSchema();
  await prisma.block.deleteMany();
  await prisma.page.deleteMany();

  const seedPages = clonePages(initialPages);

  for (let index = 0; index < seedPages.length; index += 1) {
    const page = seedPages[index];

    await prisma.page.create({
      data: {
        id: page.id,
        title: page.title,
        sortOrder: index,
        schemaVersion: 1,
        blocks: {
          create: page.blocks.map((block, blockIndex) => toBlockCreateInput(block, blockIndex)),
        },
      },
    });
  }
}

function nextSortOrderFromPages(pages: Array<{ sortOrder: number }>) {
  if (pages.length === 0) {
    return 0;
  }

  return Math.min(...pages.map((page) => page.sortOrder)) - 1;
}

export function createPrismaPageRepository(): PageRepository {
  return {
    async listPages() {
      await ensureBootstrapped();
      const pages = await fetchPages();
      return pages.map(toPageItem);
    },

    async getPage(pageId: string) {
      await ensureBootstrapped();
      const page = await fetchPage(pageId);

      if (!page || page.deletedAt) {
        return null;
      }

      return toPageItem(page);
    },

    async createPage(input: CreatePageInput = {}) {
      await ensureBootstrapped();
      const pages = await prisma.page.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          sortOrder: true,
        },
      });
      const defaultPage = createDefaultPage();
      const nextPage = await prisma.page.create({
        data: {
          id: defaultPage.id,
          title: input.title ?? defaultPage.title,
          sortOrder: nextSortOrderFromPages(pages),
          schemaVersion: 1,
          blocks: {
            create: (input.blocks ?? defaultPage.blocks).map((block, blockIndex) =>
              toBlockCreateInput(cloneBlock(block), blockIndex),
            ),
          },
        },
        include: {
          blocks: true,
        },
      });

      return toPageItem(nextPage);
    },

    async updatePage(pageId: string, updates: UpdatePageInput) {
      await ensureBootstrapped();
      const currentPage = await fetchPage(pageId);

      if (!currentPage || currentPage.deletedAt) {
        return null;
      }

      const nextPage = await prisma.$transaction(async (tx) => {
        if (updates.title !== undefined) {
          await tx.page.update({
            where: {
              id: pageId,
            },
            data: {
              title: updates.title,
            },
          });
        } else {
          await tx.page.update({
            where: {
              id: pageId,
            },
            data: {
              sortOrder: currentPage.sortOrder,
            },
          });
        }

        if (updates.blocks) {
          await tx.block.deleteMany({
            where: {
              pageId,
            },
          });

          await tx.block.createMany({
            data: updates.blocks.map((block, blockIndex) =>
              toBlockCreateManyInput(pageId, cloneBlock(block), blockIndex),
            ),
          });
        }

        return tx.page.findUnique({
          where: {
            id: pageId,
          },
          include: {
            blocks: true,
          },
        });
      });

      return nextPage ? toPageItem(nextPage) : null;
    },

    async deletePage(pageId: string) {
      await ensureBootstrapped();
      const currentPage = await fetchPage(pageId);

      if (!currentPage || currentPage.deletedAt) {
        return false;
      }

      const now = new Date();

      await prisma.$transaction([
        prisma.page.update({
          where: {
            id: pageId,
          },
          data: {
            deletedAt: now,
          },
        }),
        prisma.block.updateMany({
          where: {
            pageId,
            deletedAt: null,
          },
          data: {
            deletedAt: now,
          },
        }),
      ]);

      return true;
    },

    async reorderBlocks(pageId: string, blockIds: string[]) {
      await ensureBootstrapped();
      const currentPage = await prisma.page.findUnique({
        where: {
          id: pageId,
        },
        include: {
          blocks: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      if (!currentPage || currentPage.deletedAt) {
        return null;
      }

      const blockById = new Map(currentPage.blocks.map((block) => [block.id, block]));
      const reorderedIds = new Set<string>();
      const orderedBlocks: Array<{ id: string; position: number }> = [];

      for (const blockId of blockIds) {
        const block = blockById.get(blockId);

        if (!block) {
          continue;
        }

        reorderedIds.add(block.id);
        orderedBlocks.push({
          id: block.id,
          position: orderedBlocks.length,
        });
      }

      for (const block of currentPage.blocks) {
        if (reorderedIds.has(block.id)) {
          continue;
        }

        orderedBlocks.push({
          id: block.id,
          position: orderedBlocks.length,
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.block.updateMany({
          where: {
            pageId,
            deletedAt: null,
          },
          data: {
            position: {
              increment: 1000,
            },
          },
        });

        for (const block of orderedBlocks) {
          await tx.block.update({
            where: {
              id: block.id,
            },
            data: {
              position: block.position,
            },
          });
        }

        await tx.page.update({
          where: {
            id: pageId,
          },
          data: {
            sortOrder: currentPage.sortOrder,
          },
        });
      });

      const refreshedPage = await fetchPage(pageId);
      return refreshedPage ? toPageItem(refreshedPage) : null;
    },
  };
}
