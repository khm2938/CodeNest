import { beforeEach, describe, expect, it, vi } from "vitest";
import { getInitialPages } from "../pages/pages";
import { createApiPageRepository } from "./api-page-repository";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("createApiPageRepository", () => {
  it("페이지 목록을 요청한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(getInitialPages()), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const repository = createApiPageRepository();
    const pages = await repository.listPages();

    expect(fetchMock).toHaveBeenCalledWith("/api/pages", expect.objectContaining({ method: "GET" }));
    expect(pages).toHaveLength(2);
  });

  it("페이지를 생성한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "page-3",
          title: "새 페이지",
          blocks: [],
          updatedAt: "방금 전",
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const repository = createApiPageRepository();
    const page = await repository.createPage({ title: "새 페이지" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pages",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(page.title).toBe("새 페이지");
  });

  it("페이지가 없으면 null을 반환한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));

    vi.stubGlobal("fetch", fetchMock);

    const repository = createApiPageRepository();
    const page = await repository.getPage("page-404");

    expect(page).toBeNull();
  });
});
