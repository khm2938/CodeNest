# 블록 단위 편집 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CodeNest의 페이지 본문을 `텍스트`, `제목`, `체크박스`, `코드블록` 4종 블록 기반 편집기로 전환한다.

**Architecture:** 페이지 데이터는 `PageItem` 안에 `blocks` 배열을 갖고, UI는 블록 편집기와 미리보기를 분리한다. `pages.ts`는 순수 데이터 조작 함수만 담당하고, `page-workspace.tsx`는 블록 편집 UI와 이벤트를 담당한다. `page.tsx`는 상태 연결만 유지해서 나중에 저장소 연동으로 바꾸기 쉽게 만든다.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, plain CSS

---

### Task 1: Redefine page data around blocks

**Files:**
- Modify: `app/src/features/pages/pages.ts`
- Test: `app/src/features/pages/pages.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("새 페이지를 만들면 기본 블록이 들어간다", () => {
  const nextPages = createPage(getInitialPages());

  expect(nextPages[0]).toMatchObject({
    title: "제목 없음",
    blocks: [
      {
        type: "text",
        text: "",
      },
    ],
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm exec vitest run src/features/pages/pages.test.ts`

Expected: FAIL because `blocks` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export type BlockType = "text" | "heading" | "checklist" | "code";

export type Block = {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
  language?: string;
};

export type PageItem = {
  id: string;
  title: string;
  blocks: Block[];
  updatedAt: string;
};
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm exec vitest run src/features/pages/pages.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/features/pages/pages.ts app/src/features/pages/pages.test.ts
git commit -m "feat: model pages as block lists"
```

### Task 2: Replace the single textarea with a block editor

**Files:**
- Modify: `app/src/features/pages/page-workspace.tsx`
- Modify: `app/src/features/pages/page-workspace.test.tsx`

- [ ] **Step 1: Write the failing test**

```ts
it("블록 편집기가 텍스트, 제목, 체크박스, 코드블록을 각각 수정한다", () => {
  const onUpdatePage = vi.fn();

  render(
    createElement(PageWorkspace, {
      pages: [
        {
          id: "page-1",
          title: "시작하기",
          blocks: [
            { id: "b1", type: "heading", text: "개요" },
            { id: "b2", type: "checklist", text: "계획 정리", checked: false },
            { id: "b3", type: "code", text: "console.log('hi')", language: "ts" },
          ],
          updatedAt: "오늘",
        },
      ],
      selectedPageId: "page-1",
      onCreatePage: vi.fn(),
      onSelectPage: vi.fn(),
      onUpdatePage,
    }),
  );
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm exec vitest run src/features/pages/page-workspace.test.tsx`

Expected: FAIL because the current editor only knows `title` and `content`.

- [ ] **Step 3: Write minimal implementation**

```ts
type BlockEditorProps = {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onRemove: () => void;
};
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm exec vitest run src/features/pages/page-workspace.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/features/pages/page-workspace.tsx app/src/features/pages/page-workspace.test.tsx
git commit -m "feat: add block editor workspace"
```

### Task 3: Connect the new block model to the app shell

**Files:**
- Modify: `app/src/app/page.tsx`
- Modify: `app/src/app/page.test.tsx`

- [ ] **Step 1: Write the failing test**

```ts
it("페이지를 생성하면 기본 블록 기반 페이지가 유지된다", () => {
  render(createElement(HomePage));

  fireEvent.click(screen.getByRole("button", { name: "새 페이지" }));

  expect(screen.getByText("제목 없음")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm exec vitest run src/app/page.test.tsx`

Expected: FAIL until `page.tsx` and `pages.ts` agree on the new data shape.

- [ ] **Step 3: Write minimal implementation**

```ts
onUpdatePage={(pageId, updates) => {
  setPages((currentPages) => updatePage(currentPages, pageId, updates));
  setActiveSectionId("pages");
}}
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm exec vitest run src/app/page.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/app/page.tsx app/src/app/page.test.tsx
git commit -m "feat: wire block pages into app shell"
```

### Task 4: Add block styling and keep the UI readable

**Files:**
- Modify: `app/src/app/globals.css`

- [ ] **Step 1: Add block layout styles**

```css
.block-editor {
  display: grid;
  gap: 1rem;
}

.block-editor__item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
}
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/src/app/globals.css
git commit -m "style: add block editor layout"
```

### Task 5: Final verification

**Files:**
- No code changes expected

- [ ] **Step 1: Run the targeted test suite**

Run:

```powershell
npm exec vitest run src/features/pages/pages.test.ts src/features/pages/page-workspace.test.tsx src/app/page.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the production build**

Run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit any final fixes**

```bash
git add .
git commit -m "feat: ship block editor v1"
```

---

## Spec Coverage Check

- Page data model with `blocks`: Task 1
- Block types `text`, `heading`, `checklist`, `code`: Task 1 and Task 2
- Block editing UI: Task 2
- App state wiring: Task 3
- Styling: Task 4
- Tests and build verification: Tasks 1, 2, 3, 4, 5

