import { describe, expect, it } from "vitest";
import { createPage, getInitialPages, updatePage } from "./pages";

describe("pages", () => {
  it("새 페이지를 만들면 목록 맨 앞에 추가된다", () => {
    const initialPages = getInitialPages();
    const nextPages = createPage(initialPages);

    expect(nextPages).toHaveLength(initialPages.length + 1);
    expect(nextPages[0]).toMatchObject({
      id: "page-3",
      title: "제목 없음",
    });
    expect(nextPages[1]).toMatchObject({
      id: "page-1",
      title: "시작하기",
    });
  });

  it("선택한 페이지의 제목과 내용을 수정한다", () => {
    const initialPages = getInitialPages();
    const nextPages = updatePage(initialPages, "page-1", {
      title: "새 제목",
      content: "새 본문",
    });

    expect(nextPages[0]).toMatchObject({
      id: "page-1",
      title: "새 제목",
      content: "새 본문",
    });
    expect(nextPages[1]).toMatchObject({
      id: "page-2",
      title: "프로젝트 노트",
    });
  });
});
