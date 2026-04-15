// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./app-sidebar";

describe("AppSidebar", () => {
  it("왼쪽 사이드바에 브랜드, 새 페이지 버튼, 최근 페이지를 보여준다", () => {
    const onSelectPage = vi.fn();
    const onCreatePage = vi.fn();
    const onNavigate = vi.fn();

    render(
      createElement(AppSidebar, {
        pages: [
          { id: "page-1", title: "시작하기", updatedAt: "오늘" },
          { id: "page-2", title: "프로젝트 노트", updatedAt: "방금 전" },
        ],
        selectedPageId: "page-1",
        onCreatePage,
        onSelectPage,
        onNavigate,
      }),
    );

    expect(screen.getByText("노션 클론")).toBeTruthy();
    expect(screen.getByRole("button", { name: "새 페이지" })).toBeTruthy();
    expect(screen.getByText("최근 페이지")).toBeTruthy();
    expect(screen.getByRole("button", { name: "시작하기 오늘" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "프로젝트 노트 방금 전" })).toBeTruthy();
  });

  it("빠른 이동 버튼을 누르면 대상 섹션으로 이동 요청을 보낸다", () => {
    const onSelectPage = vi.fn();
    const onCreatePage = vi.fn();
    const onNavigate = vi.fn();

    render(
      createElement(AppSidebar, {
        pages: [{ id: "page-1", title: "시작하기", updatedAt: "오늘" }],
        selectedPageId: "page-1",
        onCreatePage,
        onSelectPage,
        onNavigate,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "페이지" }));

    expect(onNavigate).toHaveBeenCalledWith("pages");
  });
});
