import type { PageItem } from "@/features/pages/pages";

export type SidebarSectionId = "dashboard" | "pages" | "prompts" | "settings";

type AppSidebarProps = {
  pages: PageItem[];
  selectedPageId: string;
  onCreatePage: () => void;
  onSelectPage: (pageId: string) => void;
  onNavigate: (sectionId: SidebarSectionId) => void;
  activeSectionId?: SidebarSectionId;
  isCreatingPage?: boolean;
};

const quickLinks: Array<{ label: string; targetId: SidebarSectionId }> = [
  { label: "대시보드", targetId: "dashboard" },
  { label: "페이지", targetId: "pages" },
  { label: "프롬프트", targetId: "prompts" },
  { label: "설정", targetId: "settings" },
];

export function AppSidebar({
  pages,
  selectedPageId,
  onCreatePage,
  onSelectPage,
  onNavigate,
  activeSectionId,
  isCreatingPage = false,
}: AppSidebarProps) {
  return (
    <aside className="app-sidebar" aria-label="앱 사이드바">
      <div className="app-sidebar__brand">
        <span className="app-sidebar__logo" aria-hidden="true">
          N
        </span>
        <div>
          <p className="app-sidebar__eyebrow">노션 클론</p>
          <h2>작업 공간</h2>
        </div>
      </div>

      <button type="button" className="app-sidebar__button" onClick={onCreatePage} disabled={isCreatingPage}>
        {isCreatingPage ? "새 페이지 준비 중" : "새 페이지"}
      </button>

      <nav className="app-sidebar__nav" aria-label="빠른 이동">
        {quickLinks.map((item) => {
          const isActive = item.targetId === activeSectionId;

          return (
            <button
              key={item.targetId}
              type="button"
              className={`app-sidebar__nav-item${isActive ? " app-sidebar__nav-item--active" : ""}`}
              onClick={() => onNavigate(item.targetId)}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <section className="app-sidebar__section">
        <div className="app-sidebar__section-header">
          <h3>최근 페이지</h3>
          <span>{pages.length}개</span>
        </div>

        <div className="app-sidebar__page-list">
          {pages.map((page) => {
            const isSelected = page.id === selectedPageId;
            return (
              <button
                key={page.id}
              type="button"
              className={`app-sidebar__page-item${isSelected ? " app-sidebar__page-item--active" : ""}`}
              onClick={() => onSelectPage(page.id)}
              aria-label={`${page.title} ${page.updatedAt}`}
              disabled={isCreatingPage}
            >
                <span className="app-sidebar__page-title">{page.title}</span>
                <span className="app-sidebar__page-meta">{page.updatedAt}</span>
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
