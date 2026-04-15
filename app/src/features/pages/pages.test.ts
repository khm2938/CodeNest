import { describe, expect, it } from "vitest";
import { createPage, getInitialPages, updatePage } from "./pages";

describe("pages", () => {
  it("초기 페이지는 블록 배열을 가진다", () => {
    const initialPages = getInitialPages();

    expect(initialPages[0]).toMatchObject({
      id: "page-1",
      title: "시작하기",
      blocks: [
        {
          type: "text",
          text: "첫 페이지를 만들고 편집을 시작해 보세요.",
        },
      ],
    });

    const clonedPages = getInitialPages();

    expect(clonedPages[0]).not.toBe(initialPages[0]);
    expect(clonedPages[0]?.blocks).not.toBe(initialPages[0]?.blocks);
  });

  it("새 페이지를 만들면 목록 맨 앞에 추가된다", () => {
    const initialPages = getInitialPages();
    const nextPages = createPage(initialPages);

    expect(nextPages).toHaveLength(initialPages.length + 1);
    expect(nextPages[0]).toMatchObject({
      title: "제목 없음",
    });
    expect(nextPages[0].id).toMatch(/^page-/);
    expect(nextPages[0]).toMatchObject({
      blocks: [
        {
          type: "text",
          text: "",
        },
      ],
    });
    expect(nextPages[1]).toMatchObject({
      id: "page-1",
      title: "시작하기",
    });
  });

  it("선택한 페이지의 제목과 블록을 수정한다", () => {
    const initialPages = getInitialPages();
    const nextPages = updatePage(initialPages, "page-1", {
      title: "새 제목",
      blocks: [
        {
          type: "heading",
          text: "새 제목 블록",
        },
      ],
    });

    expect(nextPages[0]).toMatchObject({
      id: "page-1",
      title: "새 제목",
      blocks: [
        {
          type: "heading",
          text: "새 제목 블록",
        },
      ],
    });
    expect(nextPages[1]).toMatchObject({
      id: "page-2",
      title: "프로젝트 노트",
    });
  });
});
