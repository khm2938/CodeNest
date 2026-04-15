# DB 저장 설계 문서

## 목표

CodeNest의 서버 저장소를 인메모리 구현에서 SQLite + Prisma 기반 저장소로 교체한다.
클라이언트와 API Route는 그대로 두고, 서버 내부 저장 계층만 바꾼다.

## 왜 필요한가

현재 서버 저장은 인메모리라서:

- 서버가 재시작되면 데이터가 사라진다
- 실제 영속 저장이 아니다
- 나중에 동기화/마이그레이션 전략을 시험할 수 없다

DB 저장으로 바꾸면:

- 데이터가 유지된다
- 페이지/블록 구조를 더 안정적으로 관리할 수 있다
- 나중에 PostgreSQL로 교체하기 쉬운 경로를 확보할 수 있다

## 추천안

### SQLite + Prisma

- 로컬 개발이 쉽다
- 단일 프로젝트에서 운영하기 편하다
- 이후 PostgreSQL로 옮기기 쉽다
- 마이그레이션 관리가 가능하다

## 설계 원칙

- `PageRepository` 계약은 유지한다
- API Route는 그대로 둔다
- 서버 repository만 Prisma 기반으로 교체한다
- 페이지와 블록은 페이지 단위로 함께 저장한다
- 삭제는 soft delete를 우선한다
- `schemaVersion`은 유지한다

## 권장 구조

### 클라이언트

- `ApiPageRepository` 사용
- 환경에 따라 필요하면 `localStoragePageRepository`로 전환 가능

### 서버

- route handler
- validation layer
- page service
- Prisma repository

### DB

- SQLite 데이터베이스 파일
- Prisma schema
- migration files

## 데이터 모델

### `Page`

- `id: string`
- `title: string`
- `sortOrder: number`
- `schemaVersion: number`
- `createdAt: Date`
- `updatedAt: Date`
- `deletedAt?: Date | null`

### `Block`

- `id: string`
- `pageId: string`
- `type: "text" | "heading" | "checklist" | "code"`
- `text: string`
- `checked?: boolean`
- `language?: string`
- `position: number`
- `schemaVersion: number`
- `createdAt: Date`
- `updatedAt: Date`
- `deletedAt?: Date | null`

## 테이블 초안

### `pages`

- `id`
- `title`
- `sort_order`
- `schema_version`
- `created_at`
- `updated_at`
- `deleted_at`

### `blocks`

- `id`
- `page_id`
- `type`
- `text`
- `checked`
- `language`
- `position`
- `schema_version`
- `created_at`
- `updated_at`
- `deleted_at`

## 저장 규칙

- 페이지 생성 시 기본 블록 1개를 함께 생성한다
- 블록 순서는 `position`으로 관리한다
- 블록 재정렬은 한 페이지 내부에서만 일어난다
- 페이지 삭제는 우선 soft delete로 처리한다
- 페이지 목록 정렬은 `sortOrder`로 처리한다
- 조회 시 `deletedAt`이 있는 레코드는 기본적으로 제외한다

## Prisma 전략

### 추천

- `pages`
- `blocks`

두 모델을 분리한다.

### 이유

- 블록 편집/재정렬이 잦다
- 페이지와 블록의 생명주기가 다르다
- 나중에 검색/필터링을 붙이기 쉽다

## 전환 전략

1. Prisma 스키마 작성
2. SQLite 데이터베이스 연결
3. 서버 repository를 Prisma 기반으로 교체
4. 기존 API Route는 그대로 사용
5. 이후 PostgreSQL로 교체할 경우 datasource만 바꾼다

## 파일 경계

- `app/prisma/schema.prisma`
  - DB 모델 정의
- `app/src/server/pages/page-repository.ts`
  - 서버 저장소 계약
- `app/src/server/pages/prisma-page-repository.ts`
  - Prisma 구현
- `app/src/server/pages/page-service.ts`
  - 비즈니스 로직
- `app/src/app/api/pages/...`
  - 요청/응답 처리

## 테스트 전략

- Prisma repository 테스트
- route handler 테스트
- CRUD 회귀 테스트
- 블록 재정렬 테스트

## 성공 기준

- 서버 재시작 후에도 데이터가 유지된다
- 클라이언트 코드는 그대로 동작한다
- 페이지/블록 CRUD가 인메모리와 동일한 계약을 유지한다
- 나중에 PostgreSQL로 교체해도 구조가 이어진다
