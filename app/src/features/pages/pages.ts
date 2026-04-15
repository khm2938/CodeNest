export type PageItem = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

const INITIAL_PAGES: PageItem[] = [
  {
    id: "page-1",
    title: "시작하기",
    content: "첫 페이지를 만들고 편집을 시작해 보세요.",
    updatedAt: "오늘",
  },
  {
    id: "page-2",
    title: "프로젝트 노트",
    content: "이곳에 할 일, 메모, 연결 링크를 적어둘 수 있습니다.",
    updatedAt: "오늘",
  },
];

export function getInitialPages(): PageItem[] {
  return INITIAL_PAGES.map((page) => ({ ...page }));
}

export function createPage(pages: PageItem[]): PageItem[] {
  const nextPageNumber = pages.length + 1;
  const newPage: PageItem = {
    id: `page-${nextPageNumber}`,
    title: "제목 없음",
    content: "",
    updatedAt: "방금 전",
  };

  return [newPage, ...pages];
}

export function updatePage(
  pages: PageItem[],
  pageId: string,
  updates: Partial<Pick<PageItem, "title" | "content">>,
): PageItem[] {
  return pages.map((page) => {
    if (page.id !== pageId) {
      return page;
    }

    return {
      ...page,
      ...updates,
      updatedAt: "방금 전",
    };
  });
}
