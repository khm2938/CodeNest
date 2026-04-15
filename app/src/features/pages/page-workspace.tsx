import type { PageItem } from "./pages";

type PageWorkspaceProps = {
  pages: PageItem[];
  selectedPageId: string;
  onCreatePage: () => void;
  onSelectPage: (pageId: string) => void;
  onUpdatePage: (pageId: string, updates: Partial<Pick<PageItem, "title" | "content">>) => void;
};

export function PageWorkspace({
  pages,
  selectedPageId,
  onCreatePage,
  onSelectPage,
  onUpdatePage,
}: PageWorkspaceProps) {
  const currentPage = pages.find((page) => page.id === selectedPageId);

  return (
    <section className="page-workspace">
      <div className="page-workspace__toolbar">
        <div>
          <p className="page-workspace__kicker">페이지</p>
          <h2>내 작업 공간</h2>
          <p className="page-workspace__lede">
            페이지 목록에서 고르고, 오른쪽에서 바로 제목과 본문을 수정합니다.
          </p>
        </div>
        <button type="button" className="page-workspace__button" onClick={onCreatePage}>
          새 페이지
        </button>
      </div>

      <div className="page-workspace__layout">
        <aside className="page-list" aria-label="페이지 목록">
          {pages.map((page) => {
            const isSelected = page.id === selectedPageId;
            return (
              <button
                key={page.id}
                type="button"
                className={`page-list__item${isSelected ? " page-list__item--active" : ""}`}
                onClick={() => onSelectPage(page.id)}
              >
                <span className="page-list__title">{page.title}</span>
                <span className="page-list__meta">{page.updatedAt}</span>
              </button>
            );
          })}
        </aside>

        <div className="page-editor">
          {currentPage ? (
            <>
              <div className="page-editor__header">
                <p className="page-preview__kicker">편집 중인 페이지</p>
                <p className="page-editor__meta">마지막 수정: {currentPage.updatedAt}</p>
              </div>

              <label className="page-editor__field">
                <span>페이지 제목</span>
                <input
                  type="text"
                  value={currentPage.title}
                  onChange={(event) => onUpdatePage(currentPage.id, { title: event.target.value })}
                  aria-label="페이지 제목"
                />
              </label>

              <label className="page-editor__field page-editor__field--body">
                <span>페이지 본문</span>
                <textarea
                  value={currentPage.content}
                  onChange={(event) => onUpdatePage(currentPage.id, { content: event.target.value })}
                  aria-label="페이지 본문"
                  rows={10}
                />
              </label>

              <div className="page-editor__preview">
                <span>실시간 미리보기</span>
                <h3>{currentPage.title || "제목 없음"}</h3>
                <p>{currentPage.content || "내용을 입력하면 여기에 바로 보입니다."}</p>
              </div>
            </>
          ) : (
            <div className="page-editor__empty">
              <p className="page-preview__kicker">편집기</p>
              <h3>선택된 페이지가 없습니다</h3>
              <p>왼쪽 목록에서 페이지를 선택하거나 새 페이지를 만들어 시작하세요.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
