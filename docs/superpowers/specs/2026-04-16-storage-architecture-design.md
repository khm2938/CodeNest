# 저장 구조 설계 문서

## 목표

CodeNest의 페이지와 블록 저장 구조를 화면 상태와 분리한다.
초기에는 개발 편의성을 유지하되, 나중에 `localStorage`에서 서버/DB 저장으로 자연스럽게 전환할 수 있어야 한다.

## 문제 정의

현재 CodeNest는 화면 상태를 React state 안에만 들고 있다.
이 방식은 빠르지만 다음 단계에서 한계가 있다.

- 새로고침하면 상태가 사라진다
- 저장 방식이 화면 코드와 섞이면 교체가 어렵다
- 나중에 서버/DB를 붙일 때 UI 코드까지 크게 바뀔 가능성이 높다

## 설계 원칙

- 화면은 저장 방식을 모른다
- 저장 로직은 저장소 인터페이스 뒤에 숨긴다
- 페이지와 블록 순서는 명시적으로 저장한다
- 삭제는 처음부터 soft delete를 고려한다
- 나중에 저장 방식이 바뀌어도 UI 컴포넌트는 그대로 유지한다

## 권장 아키텍처

### 1) 화면 상태

React state는 현재 보고 있는 페이지, 선택된 페이지, 입력 중인 값만 담당한다.
실제 페이지 데이터의 원본은 저장소에서 읽어온다.

### 2) 저장소 인터페이스

저장 방식과 무관하게 공통으로 쓸 인터페이스를 둔다.

```ts
interface PageRepository {
  listPages(): Promise<Page[]>;
  getPage(pageId: string): Promise<Page | null>;
  createPage(input: CreatePageInput): Promise<Page>;
  updatePage(pageId: string, input: UpdatePageInput): Promise<Page>;
  deletePage(pageId: string): Promise<void>;
  reorderBlocks(pageId: string, blockIds: string[]): Promise<Page>;
}
```

### 3) 저장소 구현체

- `LocalStoragePageRepository`
  - 브라우저에서 즉시 동작
  - 개발 초기에 유용
- `ApiPageRepository`
  - 나중에 Next.js API route 또는 별도 백엔드로 연결
- `InMemoryPageRepository`
  - 테스트용

### 4) 서버 API

서버 저장으로 옮길 때는 아래 엔드포인트를 기준으로 시작한다.

- `GET /api/pages`
- `POST /api/pages`
- `GET /api/pages/:id`
- `PATCH /api/pages/:id`
- `DELETE /api/pages/:id`
- `PATCH /api/pages/:id/blocks/reorder`

## 도메인 모델

### Page

- `id: string`
- `title: string`
- `blocks: Block[]`
- `createdAt: string`
- `updatedAt: string`
- `deletedAt?: string | null`

### Block

- `id: string`
- `pageId: string`
- `type: "text" | "heading" | "checklist" | "code"`
- `text: string`
- `checked?: boolean`
- `language?: string`
- `position: number`
- `createdAt: string`
- `updatedAt: string`
- `deletedAt?: string | null`

## DB 스키마 초안

### `pages`

- `id`
- `title`
- `created_at`
- `updated_at`
- `deleted_at`
- `sort_order`

### `blocks`

- `id`
- `page_id`
- `type`
- `text`
- `checked`
- `language`
- `position`
- `created_at`
- `updated_at`
- `deleted_at`

## 저장 규칙

- 페이지 수정 시 `updatedAt`을 갱신한다
- 블록 수정 시에도 부모 페이지의 `updatedAt`을 갱신한다
- 블록 순서는 `position`으로 저장한다
- 블록 삭제는 처음부터 물리 삭제보다 soft delete를 우선한다
- 페이지 삭제도 나중에 복구 가능성을 위해 soft delete를 기본으로 둔다
- 새 페이지는 기본 블록 1개와 함께 생성한다

## 전환 전략

### 1단계: 저장소 인터페이스 추가

화면은 `PageRepository`만 의존하게 만든다.

### 2단계: localStorage 구현

서버 없이도 새로고침 후 상태가 남도록 만든다.

### 3단계: 서버 API 연결

저장소 구현체만 `ApiPageRepository`로 교체한다.

### 4단계: DB 연결

서버 내부에서 pages/blocks 테이블을 사용한다.

## 예상 파일 경계

- `app/src/features/pages/pages.ts`
  - 도메인 타입
  - 기본 데이터
  - 순수 데이터 조작
- `app/src/features/storage/page-repository.ts`
  - 저장소 인터페이스
- `app/src/features/storage/local-storage-page-repository.ts`
  - 브라우저 저장 구현
- `app/src/features/storage/api-page-repository.ts`
  - 서버 API 구현
- `app/src/app/api/pages/...`
  - 서버 엔드포인트

## 테스트 전략

- 저장소 인터페이스 테스트
- localStorage 저장/복원 테스트
- API 스펙 테스트
- 페이지/블록 CRUD 회귀 테스트

## 성공 기준

- 화면 코드는 저장 방식에 직접 의존하지 않는다
- 새로고침 후에도 페이지가 유지된다
- 나중에 서버/DB로 바꿔도 UI 변경이 최소화된다
- 블록 순서와 페이지 상태가 저장소를 통해 안정적으로 유지된다
