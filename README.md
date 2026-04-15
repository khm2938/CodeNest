# CodeNest

CodeNest는 IT 개발자 중심의 노션 스타일 작업 공간입니다.
문서, 페이지, 프로젝트 메모, 프롬프트 템플릿을 한곳에서 다루고,
기능은 작게 쪼개서 계속 확장하는 방식으로 개발합니다.

## 현재 상태

- Next.js App Router 기반의 웹 앱
- 한국어 우선 UI와 문서
- 왼쪽 사이드바 + 페이지 편집기 + 프롬프트 라이브러리 구성
- 프롬프트와 프로젝트 상태를 파일로 분리 관리

## 빠른 시작

### Docker로 실행

```powershell
docker compose up -d --build
```

### 로컬 앱 실행

```powershell
cd app
npm install
npm run dev
```

기본 개발 주소는 `http://localhost:3000`입니다.

## 개발 스택

- Next.js
- React
- TypeScript
- Vitest
- 순수 CSS

## 프로젝트 구조

- `app/`은 실제 웹 앱 코드
- `prompts/`는 재사용 프롬프트 템플릿
- `state/`는 현재 결정 사항과 작업 맥락
- `docs/`는 계획과 보조 문서

## 작업 방식

1. 기능을 작은 단위로 나눕니다.
2. 설계와 테스트를 먼저 확인합니다.
3. 구현 후 검증하고 GitHub에 올립니다.
4. 다음 기능으로 자연스럽게 확장합니다.

## 관련 문서

- [앱 README](./app/README.md)
- [프롬프트 인덱스](./prompts/00-index.md)
- [현재 상태](./state/current-state.md)
