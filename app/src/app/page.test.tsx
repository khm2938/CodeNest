// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import { createElement } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getInitialPages, type PageItem } from "@/features/pages/pages";
import HomePage from "./page";
import { resolveActiveSectionId } from "./section-navigation";

let serverPages: PageItem[] = [];
let createdPageCount = 0;

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

function createDeferredResponse<T>() {
  let resolve: ((value: T) => void) | null = null;

  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return {
    promise,
    resolve(value: T) {
      resolve?.(value);
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  serverPages = clonePages(getInitialPages());
  createdPageCount = 0;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost");
      const method = init?.method ?? "GET";

      if (url.pathname === "/api/pages" && method === "GET") {
        return createJsonResponse(serverPages);
      }

      if (url.pathname === "/api/pages" && method === "POST") {
        createdPageCount += 1;
        const createdPage: PageItem = {
          id: `page-created-${createdPageCount}`,
          title: "제목 없음",
          blocks: [
            {
              id: `block-created-${createdPageCount}`,
              type: "text",
              text: "",
            },
          ],
          updatedAt: "방금 전",
        };

        serverPages = [createdPage, ...serverPages];
        return createJsonResponse(createdPage, 201);
      }

      if (url.pathname.startsWith("/api/pages/") && method === "PATCH") {
        const pageId = url.pathname.split("/").at(-1) ?? "";
        const updates = JSON.parse(init?.body ? String(init.body) : "{}") as Partial<PageItem>;

        serverPages = serverPages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                ...updates,
                blocks: updates.blocks ?? page.blocks,
              }
            : page,
        );

        const updatedPage = serverPages.find((page) => page.id === pageId);
        return updatedPage ? createJsonResponse(updatedPage) : createJsonResponse(null, 404);
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

  it("새 페이지 생성 중에는 이전 페이지 편집을 잠그고, 준비 후 새 페이지를 편집한다", async () => {
    const createdPage: PageItem = {
      id: "page-created-race",
      title: "제목 없음",
      blocks: [
        {
          id: "block-created-race",
          type: "text",
          text: "",
        },
      ],
      updatedAt: "방금 전",
    };
    const delayedPages = createDeferredResponse<PageItem[]>();

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input), "http://localhost");
        const method = init?.method ?? "GET";

        if (url.pathname === "/api/pages" && method === "GET") {
          if (serverPages.some((pageItem) => pageItem.id === createdPage.id)) {
            const nextPages = await delayedPages.promise;
            return createJsonResponse(nextPages);
          }

          return createJsonResponse(serverPages);
        }

        if (url.pathname === "/api/pages" && method === "POST") {
          serverPages = [createdPage, ...serverPages];
          return createJsonResponse(createdPage, 201);
        }

        if (url.pathname.startsWith("/api/pages/") && method === "PATCH") {
          const pageId = url.pathname.split("/").at(-1) ?? "";
          const updates = JSON.parse(init?.body ? String(init.body) : "{}") as Partial<PageItem>;

          serverPages = serverPages.map((pageItem) =>
            pageItem.id === pageId
              ? {
                  ...pageItem,
                  ...updates,
                  blocks: updates.blocks ?? pageItem.blocks,
                }
              : pageItem,
          );

          const updatedPage = serverPages.find((pageItem) => pageItem.id === pageId);
          return updatedPage ? createJsonResponse(updatedPage) : createJsonResponse(null, 404);
        }

        return createJsonResponse(null, 404);
      }),
    );

    render(createElement(HomePage));

    await screen.findByDisplayValue("시작하기");

    fireEvent.click(screen.getAllByRole("button", { name: "새 페이지" })[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("페이지 제목")).toBeDisabled();
    });

    expect(serverPages.find((page) => page.id === createdPage.id)?.title).toBe("제목 없음");
    expect(serverPages.find((page) => page.id === "page-1")?.title).toBe("시작하기");

    await act(async () => {
      delayedPages.resolve(serverPages);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByLabelText("페이지 제목")).toHaveValue("제목 없음");
      expect(screen.getByLabelText("페이지 제목")).not.toBeDisabled();
    });

    fireEvent.change(screen.getByLabelText("페이지 제목"), {
      target: {
        value: "방금 만든 페이지",
      },
    });

    expect(serverPages.find((page) => page.id === createdPage.id)?.title).toBe("방금 만든 페이지");
    expect(serverPages.find((page) => page.id === "page-1")?.title).toBe("시작하기");
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
