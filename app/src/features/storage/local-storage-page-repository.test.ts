import { beforeEach, describe, expect, it } from "vitest";
import { getInitialPages } from "../pages/pages";
import { createLocalStoragePageRepository } from "./local-storage-page-repository";

const STORAGE_PREFIX = "codenest";

beforeEach(() => {
  localStorage.clear();
});

describe("createLocalStoragePageRepository", () => {
  it("초기 페이지를 저장하고 목록으로 다시 읽는다", async () => {
    const repository = createLocalStoragePageRepository(getInitialPages());

    const pages = await repository.listPages();

    expect(pages).toHaveLength(2);
    expect(pages[0].title).toBe("시작하기");
    expect(localStorage.getItem(`${STORAGE_PREFIX}:page-index`)).toContain("page-1");
  });

  it("페이지 하나만 수정하면 해당 페이지가 다시 저장된다", async () => {
    const repository = createLocalStoragePageRepository(getInitialPages());

    await repository.updatePage("page-1", {
      title: "바뀐 제목",
    });

    const loaded = await repository.getPage("page-1");

    expect(loaded?.title).toBe("바뀐 제목");
    expect(JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:page:page-1`) ?? "{}")).toMatchObject({
      title: "바뀐 제목",
    });
  });

  it("페이지를 삭제하면 인덱스와 본문이 함께 사라진다", async () => {
    const repository = createLocalStoragePageRepository(getInitialPages());

    const removed = await repository.deletePage("page-1");

    expect(removed).toBe(true);
    expect(await repository.getPage("page-1")).toBeNull();
    expect(localStorage.getItem(`${STORAGE_PREFIX}:page:page-1`)).toBeNull();
  });

  it("블록 순서를 페이지 단위로 다시 저장한다", async () => {
    const repository = createLocalStoragePageRepository([
      {
        id: "page-1",
        title: "시작하기",
        blocks: [
          { id: "block-1", type: "text", text: "첫 번째" },
          { id: "block-2", type: "text", text: "두 번째" },
        ],
        updatedAt: "오늘",
      },
    ]);

    const reordered = await repository.reorderBlocks("page-1", ["block-2", "block-1"]);

    expect(reordered?.blocks.map((block) => block.id)).toEqual(["block-2", "block-1"]);
    expect(JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:page:page-1`) ?? "{}").blocks).toEqual([
      { id: "block-2", type: "text", text: "두 번째" },
      { id: "block-1", type: "text", text: "첫 번째" },
    ]);
  });
});
