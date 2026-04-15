// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageWorkspace } from "./page-workspace";

describe("PageWorkspace", () => {
  it("선택된 페이지 제목과 본문을 바로 수정한다", () => {
    const onCreatePage = vi.fn();
    const onSelectPage = vi.fn();
    const onUpdatePage = vi.fn();

    render(
      createElement(PageWorkspace, {
        pages: [
          { id: "page-1", title: "시작하기", content: "첫 내용", updatedAt: "오늘" },
          { id: "page-2", title: "프로젝트 노트", content: "", updatedAt: "오늘" },
        ],
        selectedPageId: "page-1",
        onCreatePage,
        onSelectPage,
        onUpdatePage,
      }),
    );

    fireEvent.change(screen.getByLabelText("페이지 제목"), {
      target: { value: "새 제목" },
    });

    fireEvent.change(screen.getByLabelText("페이지 본문"), {
      target: { value: "새 본문" },
    });

    expect(onUpdatePage).toHaveBeenCalledWith("page-1", {
      title: "새 제목",
    });
    expect(onUpdatePage).toHaveBeenCalledWith("page-1", {
      content: "새 본문",
    });
  });
});
