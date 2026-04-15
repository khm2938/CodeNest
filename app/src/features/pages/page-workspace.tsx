import type { Block, PageItem } from "./pages";

type PageWorkspaceProps = {
  pages: PageItem[];
  selectedPageId: string;
  onCreatePage: () => void;
  onSelectPage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, updates: Partial<Pick<PageItem, "title" | "blocks">>) => void;
};

function createTextBlock(): Block {
  return {
    id: `block-${crypto.randomUUID()}`,
    type: "text",
    text: "",
  };
}

function updateBlockAtIndex(blocks: Block[], index: number, nextBlock: Block): Block[] {
  return blocks.map((block, currentIndex) => (currentIndex === index ? nextBlock : block));
}

function moveBlockAtIndex(blocks: Block[], index: number, direction: "up" | "down"): Block[] {
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= blocks.length) {
    return blocks;
  }

  const nextBlocks = [...blocks];
  const [movingBlock] = nextBlocks.splice(index, 1);
  nextBlocks.splice(targetIndex, 0, movingBlock);

  return nextBlocks;
}

function getBlockPreview(block: Block, index: number) {
  const blockNumber = index + 1;

  switch (block.type) {
    case "heading":
      return (
        <article key={block.id} className="page-block-preview">
          <p className="page-block-preview__kicker">제목 블록 {blockNumber}</p>
          <h4>{block.text || "제목 없음"}</h4>
        </article>
      );
    case "checklist":
      return (
        <article key={block.id} className="page-block-preview">
          <p className="page-block-preview__kicker">체크리스트 블록 {blockNumber}</p>
          <label className="page-block-preview__check">
            <input type="checkbox" checked={Boolean(block.checked)} readOnly />
            <span>{block.text || "할 일을 적어보세요."}</span>
          </label>
        </article>
      );
    case "code":
      return (
        <article key={block.id} className="page-block-preview">
          <p className="page-block-preview__kicker">코드 블록 {blockNumber}</p>
          <span className="page-block-preview__language">{block.language || "언어 없음"}</span>
          <pre>
            <code>{block.text || "코드를 입력하면 여기에 보입니다."}</code>
          </pre>
        </article>
      );
    case "text":
    default:
      return (
        <article key={block.id} className="page-block-preview">
          <p className="page-block-preview__kicker">텍스트 블록 {blockNumber}</p>
          <p>{block.text || "내용을 입력하면 여기에 바로 보입니다."}</p>
        </article>
      );
  }
}

function getBlockEditor(
  block: Block,
  index: number,
  onChange: (nextBlock: Block) => void,
  onDelete: () => void,
  onMoveUp: () => void,
  onMoveDown: () => void,
  canMoveUp: boolean,
  canMoveDown: boolean,
) {
  const blockNumber = index + 1;
  const blockHeader =
    block.type === "heading"
      ? "제목 블록"
      : block.type === "checklist"
        ? "체크리스트 블록"
        : block.type === "code"
          ? "코드 블록"
          : "텍스트 블록";

  return (
    <article key={block.id} className="page-block-editor">
      <div className="page-block-editor__header">
        <div>
          <p className="page-block-editor__kicker">{blockHeader}</p>
          <h4>{block.type === "heading" ? "제목" : block.type === "checklist" ? "할 일" : block.type === "code" ? "코드" : "본문"}</h4>
        </div>
        <div className="page-block-editor__actions">
          <button
            type="button"
            aria-label={`블록 ${blockNumber} 위로 이동`}
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            위로
          </button>
          <button
            type="button"
            aria-label={`블록 ${blockNumber} 아래로 이동`}
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            아래로
          </button>
          <button type="button" onClick={onDelete}>
            블록 삭제
          </button>
        </div>
      </div>

      {block.type === "heading" ? (
        <label className="page-editor__field">
          <span>제목 내용</span>
          <input
            type="text"
            aria-label={`제목 블록 ${blockNumber}`}
            value={block.text}
            onChange={(event) =>
              onChange({
                ...block,
                text: event.target.value,
              })
            }
          />
        </label>
      ) : null}

      {block.type === "text" ? (
        <label className="page-editor__field">
          <span>본문 내용</span>
          <textarea
            aria-label={`텍스트 블록 ${blockNumber}`}
            value={block.text}
            onChange={(event) =>
              onChange({
                ...block,
                text: event.target.value,
              })
            }
            rows={4}
          />
        </label>
      ) : null}

      {block.type === "checklist" ? (
        <div className="page-block-editor__checklist">
          <label className="page-block-editor__check">
            <input
              type="checkbox"
              aria-label="체크리스트 완료"
              checked={Boolean(block.checked)}
              onChange={(event) =>
                onChange({
                  ...block,
                  checked: event.target.checked,
                })
              }
            />
            <span>완료</span>
          </label>

          <label className="page-editor__field">
            <span>체크리스트 내용</span>
            <input
              type="text"
              aria-label={`체크리스트 블록 ${blockNumber}`}
              value={block.text}
              onChange={(event) =>
                onChange({
                  ...block,
                  text: event.target.value,
                })
              }
            />
          </label>
        </div>
      ) : null}

      {block.type === "code" ? (
        <div className="page-block-editor__code">
          <label className="page-editor__field">
            <span>코드 언어</span>
            <input
              type="text"
              aria-label={`코드 언어 ${blockNumber}`}
              value={block.language ?? ""}
              placeholder="ts"
              onChange={(event) =>
                onChange({
                  ...block,
                  language: event.target.value,
                })
              }
            />
          </label>

          <label className="page-editor__field">
            <span>코드 내용</span>
            <textarea
              aria-label={`코드 블록 ${blockNumber}`}
              value={block.text}
              onChange={(event) =>
                onChange({
                  ...block,
                  text: event.target.value,
                })
              }
              rows={6}
            />
          </label>
        </div>
      ) : null}
    </article>
  );
}

export function PageWorkspace({
  pages,
  selectedPageId,
  onCreatePage,
  onSelectPage,
  onDeletePage,
  onUpdatePage,
}: PageWorkspaceProps) {
  const currentPage = pages.find((page) => page.id === selectedPageId);

  const updateCurrentPage = (updates: Partial<Pick<PageItem, "title" | "blocks">>) => {
    if (!currentPage) {
      return;
    }

    onUpdatePage(currentPage.id, updates);
  };

  const addTextBlock = () => {
    if (!currentPage) {
      return;
    }

    updateCurrentPage({
      blocks: [...currentPage.blocks, createTextBlock()],
    });
  };

  const changeBlock = (index: number, nextBlock: Block) => {
    if (!currentPage) {
      return;
    }

    updateCurrentPage({
      blocks: updateBlockAtIndex(currentPage.blocks, index, nextBlock),
    });
  };

  const deleteBlock = (index: number) => {
    if (!currentPage) {
      return;
    }

    updateCurrentPage({
      blocks: currentPage.blocks.filter((_, currentIndex) => currentIndex !== index),
    });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (!currentPage) {
      return;
    }

    updateCurrentPage({
      blocks: moveBlockAtIndex(currentPage.blocks, index, direction),
    });
  };

  return (
    <section className="page-workspace">
      <div className="page-workspace__toolbar">
        <div>
          <p className="page-workspace__kicker">페이지</p>
          <h2>내 작업 공간</h2>
          <p className="page-workspace__lede">
            페이지 목록에서 고르고, 오른쪽에서 바로 제목과 블록을 수정합니다.
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
                <div>
                  <p className="page-preview__kicker">편집 중인 페이지</p>
                  <p className="page-editor__meta">마지막 수정: {currentPage.updatedAt}</p>
                </div>
                <button
                  type="button"
                  className="page-workspace__button page-workspace__button--danger"
                  onClick={() => onDeletePage(currentPage.id)}
                >
                  페이지 삭제
                </button>
              </div>

              <label className="page-editor__field">
                <span>페이지 제목</span>
                <input
                  type="text"
                  value={currentPage.title}
                  onChange={(event) =>
                    updateCurrentPage({
                      title: event.target.value,
                    })
                  }
                  aria-label="페이지 제목"
                />
              </label>

              <section className="page-block-editor__section" aria-label="블록 편집기">
                <div className="page-block-editor__section-header">
                  <div>
                    <p className="page-preview__kicker">블록</p>
                    <h3>본문 블록</h3>
                  </div>
                  <button type="button" className="page-workspace__button" onClick={addTextBlock}>
                    텍스트 블록 추가
                  </button>
                </div>

                <div className="page-block-editor__list">
                  {currentPage.blocks.length > 0 ? (
                    currentPage.blocks.map((block, index) =>
                      getBlockEditor(
                        block,
                        index,
                        (nextBlock) => changeBlock(index, nextBlock),
                        () => deleteBlock(index),
                        () => moveBlock(index, "up"),
                        () => moveBlock(index, "down"),
                        index > 0,
                        index < currentPage.blocks.length - 1,
                      ),
                    )
                  ) : (
                    <div className="page-block-editor__empty">
                      <p>아직 블록이 없습니다.</p>
                      <p>텍스트 블록을 추가해서 시작해 보세요.</p>
                    </div>
                  )}
                </div>
              </section>

              <div className="page-editor__preview">
                <span>실시간 미리보기</span>
                <h3>{currentPage.title || "제목 없음"}</h3>

                {currentPage.blocks.length > 0 ? (
                  <div className="page-editor__preview-blocks">
                    {currentPage.blocks.map((block, index) => getBlockPreview(block, index))}
                  </div>
                ) : (
                  <p>블록을 추가하면 여기에 바로 보입니다.</p>
                )}
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
