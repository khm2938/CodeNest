# 서버 API 저장 설계 문서

## 목표

CodeNest에 Next.js API Route 기반의 저장 계층을 추가한다.
프론트는 `PageRepository` 계약만 바라보고, 서버는 같은 계약을 API를 통해 제공한다.

## 범위

- `GET /api/pages`
- `POST /api/pages`
- `GET /api/pages/:id`
- `PATCH /api/pages/:id`
- `DELETE /api/pages/:id`
- `PATCH /api/pages/:id/blocks/reorder`

## 설계 원칙

- UI는 저장 방식 세부를 알지 못한다
- 클라이언트와 서버는 같은 도메인 모델을 공유한다
- 저장소 계약은 `PageRepository`로 고정한다
- 서버는 처음엔 인메모리 데이터 저장으로 시작하고, 나중에 DB로 교체한다
- 입력 검증은 route handler에서 하고, 실제 데이터 조작은 service layer에서 한다

## 권장 구조

### 1) 클라이언트

- `localStoragePageRepository`
- `apiPageRepository`
- UI는 환경에 따라 둘 중 하나만 사용한다

### 2) 서버

- route handler
- validation helpers
- page service
- server repository

### 3) 저장소

처음에는 서버 안에서 인메모리 저장소를 둔다.
이후 DB가 붙으면 service는 그대로 두고 storage adapter만 바꾼다.

## API 계약

### `GET /api/pages`

- 응답: 페이지 목록

### `POST /api/pages`

- 입력: `title?`, `blocks?`
- 응답: 생성된 페이지

### `GET /api/pages/:id`

- 응답: 단일 페이지 또는 `404`

### `PATCH /api/pages/:id`

- 입력: `title?`, `blocks?`
- 응답: 갱신된 페이지 또는 `404`

### `DELETE /api/pages/:id`

- 응답: 삭제 성공 여부

### `PATCH /api/pages/:id/blocks/reorder`

- 입력: `blockIds: string[]`
- 응답: 재정렬된 페이지 또는 `404`

## 에러 규칙

- 잘못된 payload: `400`
- 없는 페이지: `404`
- 서버 오류: `500`

## 테스트 전략

- route handler 테스트
- API repository 계약 테스트
- 페이지 CRUD 회귀 테스트
- 블록 재정렬 테스트

## 전환 전략

1. API route 추가
2. `ApiPageRepository` 구현
3. 클라이언트에서 환경별 저장소 선택
4. 서버 저장소를 DB로 교체

## 재사용 원칙

- `PageRepository`는 그대로 유지한다
- 저장 키, 직렬화, 인덱스 유틸은 client/server가 공유한다
- 블록 순서와 페이지 복사 로직은 공용 유틸만 사용한다
