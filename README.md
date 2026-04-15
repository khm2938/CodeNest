# 노션 클론

이 저장소는 노션 스타일 생산성 앱을 위한 도커 기반 작업 공간으로 시작합니다.

## 현재 범위

- 프로젝트 골격만 준비된 상태
- 설계와 실행을 위한 프롬프트 라이브러리
- 변하는 프로젝트 상태는 프롬프트와 분리
- 앱 루트는 Next.js App Router와 TypeScript 사용

## 컨테이너 시작

```powershell
docker compose up -d --build
```

## 구조

- `app/`은 Next.js 앱 코드
- `prompts/`는 재사용 프롬프트
- `state/`는 바뀌는 프로젝트 맥락
