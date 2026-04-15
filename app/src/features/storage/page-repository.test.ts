import { describe, expect, it } from "vitest";
import type { Block } from "../pages/pages";
import { createInMemoryPageRepository } from "./page-repository";

function createSeedBlocks(): Block[] {
  return [
    {
      id: "block-1",
      type: "text",
      text: "첫 내용",
    },
  ];
}

describe("createInMemoryPageRepository", () => {
  it("페이지 목록을 복사해서 반환한다", async () => {
    const repository = createInMemoryPageRepository([
      {
        id: "page-1",
        title: "시작하기",
        blocks: createSeedBlocks(),
        updatedAt: "오늘",
      },
    ]);

    const first = await repository.listPages();
    first[0].title = "바뀐 제목";
    first[0].blocks[0].text = "바뀐 내용";

    const second = await repository.listPages();

    expect(second[0].title).toBe("시작하기");
    expect(second[0].blocks[0].text).toBe("첫 내용");
  });

  it("페이지를 만들고 조회할 수 있다", async () => {
    const repository = createInMemoryPageRepository([]);

    const created = await repository.createPage({
      title: "새 페이지",
      blocks: createSeedBlocks(),
    });

    expect(created.id).toMatch(/^page-/);
    expect(created.title).toBe("새 페이지");

    const loaded = await repository.getPage(created.id);

    expect(loaded).toMatchObject({
      id: created.id,
      title: "새 페이지",
      blocks: [
        {
          id: "block-1",
          type: "text",
          text: "첫 내용",
        },
      ],
    });
  });

  it("페이지를 수정하고 삭제할 수 있다", async () => {
    const repository = createInMemoryPageRepository([
      {
        id: "page-1",
        title: "시작하기",
        blocks: createSeedBlocks(),
        updatedAt: "오늘",
      },
    ]);

    await repository.updatePage("page-1", {
      title: "바뀐 제목",
      blocks: [
        {
          id: "block-1",
          type: "heading",
          text: "새 블록",
        },
      ],
    });

    let loaded = await repository.getPage("page-1");

    expect(loaded).toMatchObject({
      title: "바뀐 제목",
      blocks: [
        {
          id: "block-1",
          type: "heading",
          text: "새 블록",
        },
      ],
    });

    await repository.deletePage("page-1");
    loaded = await repository.getPage("page-1");

    expect(loaded).toBeNull();
  });

  it("블록 순서를 다시 정렬할 수 있다", async () => {
    const repository = createInMemoryPageRepository([
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

    const reordered = await repository.reorderBlocks("page-1", ["block-2", "block-1"]);

    expect(reordered.blocks.map((block) => block.id)).toEqual(["block-2", "block-1"]);
  });
});
