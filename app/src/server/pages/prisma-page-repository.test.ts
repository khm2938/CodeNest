import { beforeEach, describe, expect, it } from "vitest";
import { getInitialPages } from "@/features/pages/pages";
import { createPrismaPageRepository, resetPrismaPageRepository } from "./prisma-page-repository";

beforeEach(async () => {
  await resetPrismaPageRepository(getInitialPages());
});

describe("createPrismaPageRepository", () => {
  it("초기 페이지 목록을 읽는다", async () => {
    const repository = createPrismaPageRepository();
    const pages = await repository.listPages();

    expect(pages).toHaveLength(2);
    expect(pages[0].title).toBe("시작하기");
  });

  it("페이지를 만들고 수정하고 삭제할 수 있다", async () => {
    const repository = createPrismaPageRepository();
    const created = await repository.createPage({
      title: "Prisma 테스트",
    });

    expect(created.title).toBe("Prisma 테스트");

    const updated = await repository.updatePage(created.id, {
      title: "변경",
    });

    expect(updated?.title).toBe("변경");

    expect(await repository.deletePage(created.id)).toBe(true);
    expect(await repository.getPage(created.id)).toBeNull();
  });

  it("블록 순서를 다시 정렬할 수 있다", async () => {
    const repository = createPrismaPageRepository();
    const page = await repository.createPage({
      title: "정렬",
      blocks: [
        {
          id: "reorder-block-1",
          type: "text",
          text: "첫 번째",
        },
        {
          id: "reorder-block-2",
          type: "text",
          text: "두 번째",
        },
      ],
    });

    const reordered = await repository.reorderBlocks(page.id, ["reorder-block-2", "reorder-block-1"]);

    expect(reordered?.blocks.map((block) => block.id)).toEqual(["reorder-block-2", "reorder-block-1"]);
  });
});
