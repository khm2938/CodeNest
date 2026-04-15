# 앱 소스

이 폴더는 노션 스타일 앱의 애플리케이션 루트입니다.

## 스택

- Next.js App Router
- TypeScript
- React
- 첫 단계는 순수 CSS 사용

## 구조

- `src/app/`은 라우트, 레이아웃, 전역 스타일
- `src/components/`는 공용 UI
- `src/features/`는 기능 단위 모듈
- `src/lib/`는 공용 타입과 유틸리티

## 로컬 실행

```powershell
cd app
npm install
npm run dev
```

개발 서버가 뜨면 `http://localhost:3000`을 엽니다.
