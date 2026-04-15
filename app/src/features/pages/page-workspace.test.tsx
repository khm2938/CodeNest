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

  it("코드 블록의 언어와 내용을 수정한다", () => {
    renderWorkspace([
      {
        id: "page-1",
        title: "시작하기",
        blocks: [
          {
            id: "block-1",
            type: "code",
            text: "console.log('안녕');",
            language: "ts",
          },
        ],
        updatedAt: "오늘",
      },
    ]);

    fireEvent.change(screen.getByLabelText("코드 언어 1"), {
      target: { value: "tsx" },
    });

    fireEvent.change(screen.getByLabelText("코드 블록 1"), {
      target: { value: "console.log('변경');" },
    });

    const preview = screen.getByText("실시간 미리보기").closest(".page-editor__preview");
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText("tsx")).toBeInTheDocument();
    expect(within(preview as HTMLElement).getByText("console.log('변경');")).toBeInTheDocument();
  });

  it("블록을 아래로 이동하면 순서가 바뀐다", () => {
    renderWorkspace([
      {
        id: "page-1",
        title: "시작하기",
        blocks: [
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
          {
            id: "block-3",
            type: "text",
            text: "세 번째",
          },
        ],
        updatedAt: "오늘",
      },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "블록 1 아래로 이동" }));

    expect((screen.getByLabelText("텍스트 블록 1") as HTMLTextAreaElement).value).toBe("두 번째");
    expect((screen.getByLabelText("텍스트 블록 2") as HTMLTextAreaElement).value).toBe("첫 번째");

    const preview = screen.getByText("실시간 미리보기").closest(".page-editor__preview");
    expect(preview).not.toBeNull();
    const previewBlockTitles = within(preview as HTMLElement).getAllByText(/첫 번째|두 번째|세 번째/);
    expect(previewBlockTitles.map((node) => node.textContent)).toEqual(["두 번째", "첫 번째", "세 번째"]);
  });

  it("블록을 위로 이동하면 순서가 바뀐다", () => {
    renderWorkspace([
      {
        id: "page-1",
        title: "시작하기",
        blocks: [
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
        ],
        updatedAt: "오늘",
      },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "블록 2 위로 이동" }));

    expect((screen.getByLabelText("텍스트 블록 1") as HTMLTextAreaElement).value).toBe("두 번째");
    expect((screen.getByLabelText("텍스트 블록 2") as HTMLTextAreaElement).value).toBe("첫 번째");
  });

  it("첫 블록 위로와 마지막 블록 아래로 이동은 비활성화된다", () => {
    renderWorkspace([
      {
        id: "page-1",
        title: "시작하기",
        blocks: [
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
        ],
        updatedAt: "오늘",
      },
    ]);

    expect(screen.getByRole("button", { name: "블록 1 위로 이동" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "블록 2 아래로 이동" })).toBeDisabled();
  });

  it("선택된 페이지가 없으면 빈 상태를 보여준다", () => {
    render(createElement(PageWorkspace, {
      pages: [],
      selectedPageId: "",
      onCreatePage: vi.fn(),
      onSelectPage: vi.fn(),
      onUpdatePage: vi.fn(),
    }));

    expect(screen.getByText("선택된 페이지가 없습니다")).toBeInTheDocument();
    expect(screen.getByText("왼쪽 목록에서 페이지를 선택하거나 새 페이지를 만들어 시작하세요.")).toBeInTheDocument();
  });
});
