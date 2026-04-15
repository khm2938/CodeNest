import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getInitialPages } from "@/features/pages/pages";
import { createInMemoryPageRepository } from "@/features/storage/page-repository";
import {
  createPage,
  deletePage,
  getPage,
  listPages,
  reorderBlocks,
  setPageStoreRepositoryForTest,
  updatePage,
} from "./page-store";

beforeEach(() => {
  setPageStoreRepositoryForTest(createInMemoryPageRepository(getInitialPages()));
});

afterEach(() => {
  setPageStoreRepositoryForTest(createInMemoryPageRepository(getInitialPages()));
});

describe("page-store", () => {
  it("초기 페이지를 목록으로 반환한다", async () => {
    const pages = await listPages();

    expect(pages).toHaveLength(2);
    expect(pages[0].title).toBe("시작하기");
  });

  it("페이지를 만들고 수정하고 삭제할 수 있다", async () => {
    const created = await createPage("새 페이지");
    expect(created.title).toBe("새 페이지");

    const updated = await updatePage(created.id, {
      title: "바뀐 제목",
    });

    expect(updated?.title).toBe("바뀐 제목");
    expect((await getPage(created.id))?.title).toBe("바뀐 제목");

    expect(await deletePage(created.id)).toBe(true);
    expect(await getPage(created.id)).toBeNull();
  });

  it("블록 순서를 다시 정렬할 수 있다", async () => {
    const page = await createPage("정렬 페이지", [
      {
        id: "block-1",
        type: "text",
        text: "첫 번째",
      },
      {
        id: "block-2",
        type: "text",
        text: "두 번째",
      },
    ]);

    const reordered = await reorderBlocks(page.id, ["block-2", "block-1"]);

    expect(reordered?.blocks.map((block) => block.id)).toEqual(["block-2", "block-1"]);
  });
});
