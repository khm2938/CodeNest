"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AppSidebar, type SidebarSectionId } from "@/components/app-sidebar";
import { SectionCard } from "@/components/section-card";
import { PageWorkspace } from "@/features/pages/page-workspace";
import { createPage, getInitialPages, updatePage, type PageItem } from "@/features/pages/pages";
import { promptGroups } from "@/features/prompt-library/prompt-library";
import { resolveActiveSectionId } from "./section-navigation";

const settingsItems = [
  "현재는 로컬 상태만 사용",
  "나중에 저장소 연결 예정",
  "모든 문구는 한국어 우선",
];

export default function HomePage() {
  const [pages, setPages] = useState<PageItem[]>(() => getInitialPages());
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id ?? "");
  const [activeSectionId, setActiveSectionId] = useState<SidebarSectionId>("dashboard");

  useEffect(() => {
    const syncActiveSection = () => {
      setActiveSectionId(
        resolveActiveSectionId((sectionId) => {
          const element = document.getElementById(sectionId);
          if (!element || typeof element.getBoundingClientRect !== "function") {
            return null;
          }

          return element.getBoundingClientRect().top;
        }),
      );
    };

    syncActiveSection();
    window.addEventListener("scroll", syncActiveSection, { passive: true });
    window.addEventListener("resize", syncActiveSection);

    return () => {
      window.removeEventListener("scroll", syncActiveSection);
      window.removeEventListener("resize", syncActiveSection);
    };
  }, []);

  const handleCreatePage = () => {
    setPages((currentPages) => {
      const nextPages = createPage(currentPages);
      setSelectedPageId(nextPages[0]?.id ?? "");
      setActiveSectionId("pages");
      return nextPages;
    });
  };

  const handleNavigate = (sectionId: SidebarSectionId) => {
    setActiveSectionId(sectionId);

    const targetElement = document.getElementById(sectionId);
    targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AppShell>
      <main className="app-layout">
        <AppSidebar
          pages={pages}
          selectedPageId={selectedPageId}
          onCreatePage={handleCreatePage}
          onSelectPage={setSelectedPageId}
          onNavigate={handleNavigate}
          activeSectionId={activeSectionId}
        />

        <div className="app-layout__content">
          <header className="hero hero--split" id="dashboard" tabIndex={-1}>
            <div className="hero__copy">
              <p className="hero__kicker">노션 클론 MVP</p>
              <h1>페이지를 먼저 만들고, 나머지는 그 위에 쌓는다.</h1>
              <p className="hero__lede">
                첫 기능은 이 앱에 실제 흐름을 만듭니다. 페이지 목록을 보고, 새 페이지를 만들고,
                상태는 분리해 두어 나중에 쉽게 확장할 수 있게 합니다.
              </p>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <span>기능</span>
                <strong>페이지 목록과 생성 흐름</strong>
              </div>
              <div className="hero__stat">
                <span>상태</span>
                <strong>지금은 로컬, 나중에 저장소 연결</strong>
              </div>
            </div>
          </header>

          <div className="grid grid--main">
            <section id="pages" tabIndex={-1}>
              <PageWorkspace
                pages={pages}
                selectedPageId={selectedPageId}
                onCreatePage={handleCreatePage}
                onSelectPage={(pageId) => {
                  setSelectedPageId(pageId);
                  setActiveSectionId("pages");
                }}
                onUpdatePage={(pageId, updates) => {
                  setPages((currentPages) => updatePage(currentPages, pageId, updates));
                  setActiveSectionId("pages");
                }}
              />
            </section>

            <section id="prompts" tabIndex={-1}>
              <SectionCard
                eyebrow="프롬프트"
                title="재사용 라이브러리"
                description="지금 필요한 템플릿만 불러와서 사용합니다."
              >
                <div className="prompt-groups">
                  {promptGroups.map((group) => (
                    <article key={group.title} className="prompt-group">
                      <div className="prompt-group__meta">
                        <h3>{group.title}</h3>
                        <p>{group.description}</p>
                      </div>
                      <ul className="prompt-group__list">
                        {group.items.map((item) => (
                          <li key={item.path}>
                            <span>{item.name}</span>
                            <code>{item.path}</code>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </section>
          </div>

          <section className="settings-panel" id="settings" tabIndex={-1}>
            <SectionCard
              eyebrow="설정"
              title="앱 기준값"
              description="개발 중에는 작게 유지하고, 나중에 저장소와 사용자 설정으로 확장합니다."
            >
              <ul className="settings-panel__list">
                {settingsItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionCard>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
