// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createElement, useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageWorkspace } from "./page-workspace";
import { createPage, updatePage, type PageItem } from "./pages";

function renderWorkspace(initialPages: PageItem[]) {
  const onCreatePage = vi.fn();
  const onSelectPage = vi.fn();
  const onUpdatePage = vi.fn();

  function Harness() {
    const [pages, setPages] = useState(initialPages);
    const [selectedPageId, setSelectedPageId] = useState(initialPages[0]?.id ?? "");

    return createElement(PageWorkspace, {
      pages,
      selectedPageId,
      onCreatePage: () => {
        onCreatePage();
        setPages((currentPages) => {
          const nextPages = createPage(currentPages);
          setSelectedPageId(nextPages[0]?.id ?? "");
          return nextPages;
        });
      },
      onSelectPage: (pageId) => {
        onSelectPage(pageId);
        setSelectedPageId(pageId);
      },
      onUpdatePage: (pageId, updates) => {
        onUpdatePage(pageId, updates);
        setPages((currentPages) => updatePage(currentPages, pageId, updates));
      },
    });
  }

  render(createElement(Harness));

  return {
    onCreatePage,
    onSelectPage,
    onUpdatePage,
  };
}

describe("PageWorkspace", () => {
  it("선택된 페이지의 텍스트 블록과 제목을 바로 수정한다", () => {
    const { onCreatePage, onSelectPage, onUpdatePage } = renderWorkspace([
      {
        id: "page-1",
        title: "시작하기",
        blocks: [
          {
            id: "block-1",
            type: "text",
            text: "첫 내용",
          },
        ],
        updatedAt: "오늘",
      },
      {
        id: "page-2",
        title: "프로젝트 노트",
        blocks: [
          {
            id: "block-2",
            type: "code",
            text: "console.log('안녕');",
            language: "ts",
          },
        ],
        updatedAt: "오늘",
      },
    ]);

    fireEvent.change(screen.getByLabelText("페이지 제목"), {
      target: { value: "새 제목" },
    });

    fireEvent.change(screen.getByLabelText("텍스트 블록 1"), {
      target: { value: "새 본문" },
    });

    expect(onUpdatePage).toHaveBeenCalledWith("page-1", {
      title: "새 제목",
    });
    expect(onUpdatePage).toHaveBeenCalledWith("page-1", {
      blocks: [
        {
          id: "block-1",
          type: "text",
          text: "새 본문",
        },
      ],
    });

    const preview = screen.getByText("실시간 미리보기").closest(".page-editor__preview");
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText("새 본문")).toBeInTheDocument();
  });

  it("체크리스트를 토글하고 새 블록을 추가한 뒤 삭제한다", () => {
    const { onCreatePage, onSelectPage, onUpdatePage } = renderWorkspace([
      {
        id: "page-1",
        title: "시작하기",
        blocks: [
          {
            id: "block-1",
            type: "text",
            text: "첫 내용",
          },
          {
            id: "block-2",
            type: "checklist",
            text: "할 일",
            checked: false,
          },
        ],
        updatedAt: "오늘",
      },
    ]);

    fireEvent.click(screen.getByLabelText("체크리스트 완료"));

    expect(onUpdatePage).toHaveBeenCalledWith("page-1", {
      blocks: [
        {
          id: "block-1",
          type: "text",
          text: "첫 내용",
        },
        {
          id: "block-2",
          type: "checklist",
          text: "할 일",
          checked: true,
        },
      ],
    });

    fireEvent.click(screen.getByRole("button", { name: "텍스트 블록 추가" }));

    expect(screen.getByLabelText("텍스트 블록 3")).toBeInTheDocument();

    const addedBlock = screen.getByLabelText("텍스트 블록 3");
    const addedBlockCard = addedBlock.closest("article");
    expect(addedBlockCard).not.toBeNull();

    const deleteButton = within(addedBlockCard as HTMLElement).getByRole("button", {
      name: "블록 삭제",
    });

    fireEvent.click(deleteButton);

    expect(screen.queryByLabelText("텍스트 블록 3")).not.toBeInTheDocument();

    const preview = screen.getByText("실시간 미리보기").closest(".page-editor__preview");
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText("할 일")).toBeInTheDocument();
  });
});
