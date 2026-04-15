import type { PageItem } from "../pages/pages";
import type { CreatePageInput, PageRepository, UpdatePageInput } from "./page-repository";

type ApiPage = PageItem;

type RequestOptions = {
  baseUrl?: string;
};

function buildUrl(baseUrl: string | undefined, path: string) {
  return `${baseUrl ?? ""}${path}`;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function sendJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  return readJsonResponse<T>(response);
}

export function createApiPageRepository(
  options: RequestOptions = {},
): PageRepository {
  const baseUrl = options.baseUrl ?? "";

  return {
    async listPages() {
      return sendJson<ApiPage[]>(buildUrl(baseUrl, "/api/pages"), {
        method: "GET",
      });
    },

    async getPage(pageId: string) {
      const response = await fetch(buildUrl(baseUrl, `/api/pages/${pageId}`));

      if (response.status === 404) {
        return null;
      }

      return readJsonResponse<ApiPage>(response);
    },

    async createPage(input: CreatePageInput = {}) {
      return sendJson<ApiPage>(buildUrl(baseUrl, "/api/pages"), {
        method: "POST",
        body: JSON.stringify({
          title: input.title,
          blocks: input.blocks,
        }),
      });
    },

    async updatePage(pageId: string, updates: UpdatePageInput) {
      const response = await fetch(buildUrl(baseUrl, `/api/pages/${pageId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.status === 404) {
        return null;
      }

      return readJsonResponse<ApiPage>(response);
    },

    async deletePage(pageId: string) {
      const response = await fetch(buildUrl(baseUrl, `/api/pages/${pageId}`), {
        method: "DELETE",
      });

      if (response.status === 404) {
        return false;
      }

      return response.ok;
    },

    async reorderBlocks(pageId: string, blockIds: string[]) {
      const response = await fetch(buildUrl(baseUrl, `/api/pages/${pageId}/blocks/reorder`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blockIds }),
      });

      if (response.status === 404) {
        return null;
      }

      return readJsonResponse<ApiPage>(response);
    },
  };
}
