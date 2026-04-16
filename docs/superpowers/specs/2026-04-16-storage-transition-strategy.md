# 저장소 전환 전략 문서

## 목적

CodeNest의 현재 저장 기본 경로와, 이후 저장소를 바꿀 때 무엇만 교체하면 되는지 짧게 고정한다.

## 현재 기본 경로

1. UI는 `PageRepository` 계약만 사용한다.
2. 클라이언트 기본 구현은 `ApiPageRepository`다.
3. API Route는 서버 저장 계층으로 요청을 전달한다.
4. 서버 기본 저장소는 `Prisma + SQLite`다.

즉, 현재 기본 경로는 아래와 같다.

`UI -> PageRepository -> ApiPageRepository -> /api/pages -> Prisma repository -> SQLite`

## 유지할 경계

- UI는 저장 방식 세부를 모른다.
- `PageRepository` 인터페이스는 계속 유지한다.
- 클라이언트는 API 호출만 책임진다.
- 저장 방식 교체는 서버 저장소 계층에서 처리한다.

## 보조 경로

- `localStorage` 저장소는 기본 경로가 아니다.
- 필요하면 초기 실험, 오프라인 실험, 비교 테스트 용도로만 유지한다.
- 제품 기본 동작은 계속 API 저장 경로를 따른다.

## 이후 전환 규칙

### 1) SQLite -> PostgreSQL

- UI는 바꾸지 않는다.
- `ApiPageRepository`는 바꾸지 않는다.
- API Route도 가능하면 유지한다.
- 서버 Prisma datasource와 저장소 구현만 조정한다.

### 2) API 확장

- 새 기능이 추가돼도 먼저 `PageRepository` 계약에 맞는지 확인한다.
- API 응답 형식은 기존 클라이언트 계약을 깨지 않는 방향으로 유지한다.

### 3) fallback 필요 시

- fallback이 필요하면 환경 분기에서만 저장소를 고른다.
- UI 내부에서 저장소 종류를 직접 분기하지 않는다.

## 테스트 기준

- UI 테스트는 `PageRepository` 계약 기준으로 본다.
- 클라이언트 테스트는 `ApiPageRepository` 요청/응답 기준으로 본다.
- 서버 테스트는 Prisma repository와 route handler 기준으로 본다.
- 저장소를 바꿔도 기존 CRUD/블록 재정렬 계약 테스트는 유지한다.

## 지금 시점의 권장 운영

- 기본 저장소는 계속 `ApiPageRepository + Prisma + SQLite`
- `localStorage`는 기본 경로에서 제외
- 새 기능 추가 시에도 저장 구조 변경보다 `PageRepository` 계약 유지 여부를 먼저 확인

## 전환이 필요한 신호

- SQLite 파일 관리가 배포 환경에서 불편해질 때
- 동시성이나 다중 사용자 요구가 생길 때
- 서버 재시작 외의 운영 환경 제약이 커질 때

그 시점에 PostgreSQL 전환을 검토한다.
