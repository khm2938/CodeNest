// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getInitialPages, type PageItem } from "@/features/pages/pages";
import HomePage from "./page";
import { resolveActiveSectionId } from "./section-navigation";

let serverPages: PageItem[] = [];

function clonePages(pages: PageItem[]): PageItem[] {
  return pages.map((page) => ({
    ...page,
    blocks: page.blocks.map((block) => ({ ...block })),
  }));
}

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  serverPages = clonePages(getInitialPages());

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost");
      const method = init?.method ?? "GET";

      if (url.pathname === "/api/pages" && method === "GET") {
        return createJsonResponse(serverPages);
      }

      if (url.pathname === "/api/pages/page-1" && method === "DELETE") {
        serverPages = serverPages.filter((page) => page.id !== "page-1");
        return createJsonResponse({ ok: true });
      }

      return createJsonResponse(null, 404);
    }),
  );
});

describe("HomePage", () => {
  it("빠른 이동 버튼을 누르면 대상 섹션으로 스크롤한다", () => {
    const scrollIntoView = vi.fn();
    const getElementByIdSpy = vi.spyOn(document, "getElementById");

    getElementByIdSpy.mockReturnValue({
      scrollIntoView,
    } as unknown as HTMLElement);

    render(createElement(HomePage));

    fireEvent.click(screen.getByRole("button", { name: "페이지" }));

    expect(getElementByIdSpy).toHaveBeenCalledWith("pages");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("현재 페이지를 삭제하면 다음 페이지가 선택된다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(createElement(HomePage));

    await screen.findByDisplayValue("시작하기");

    fireEvent.click(screen.getByRole("button", { name: "페이지 삭제" }));

    await waitFor(() => {
      expect(screen.getByLabelText("페이지 제목")).toHaveValue("프로젝트 노트");
    });
  });
});

describe("resolveActiveSectionId", () => {
  it("더 아래에 있는 섹션을 활성 섹션으로 고른다", () => {
    const activeSectionId = resolveActiveSectionId((sectionId) => {
      const positions: Record<string, number | null> = {
        dashboard: -240,
        pages: -120,
        prompts: 80,
        settings: 680,
      };

      return positions[sectionId];
    });

    expect(activeSectionId).toBe("prompts");
  });
});
