import { beforeEach, describe, expect, it } from "vitest";
import { getInitialPages } from "@/features/pages/pages";
import { clonePage } from "@/features/storage/page-clone";
import { resetPageStore, createPage, deletePage, getPage, listPages, reorderBlocks, updatePage } from "./page-store";

beforeEach(() => {
  resetPageStore(getInitialPages());
});

describe("page-store", () => {
  it("초기 페이지를 목록으로 반환한다", () => {
    const pages = listPages();

    expect(pages).toHaveLength(2);
    expect(pages[0].title).toBe("시작하기");
  });

  it("페이지를 만들고 수정할 수 있다", () => {
    const created = createPage("새 페이지");

    expect(created.title).toBe("새 페이지");

    const updated = updatePage(created.id, {
      title: "바뀐 제목",
    });

    expect(updated?.title).toBe("바뀐 제목");
    expect(getPage(created.id)?.title).toBe("바뀐 제목");
  });

  it("페이지를 삭제할 수 있다", () => {
    expect(deletePage("page-1")).toBe(true);
    expect(getPage("page-1")).toBeNull();
    expect(listPages().map((page) => page.id)).not.toContain("page-1");
  });

  it("블록 순서를 다시 정렬할 수 있다", () => {
    const page = createPage("정렬 페이지", [
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

    const reordered = reorderBlocks(page.id, ["block-2", "block-1"]);

    expect(reordered?.blocks.map((block) => block.id)).toEqual(["block-2", "block-1"]);
  });

  it("반환 페이지는 복사본이다", () => {
    const pages = listPages();
    const nextPage = clonePage(pages[0]);

    nextPage.title = "변경";

    expect(listPages()[0].title).toBe("시작하기");
  });
});
