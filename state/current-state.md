# 현재 상태

- 제품: 노션 스타일 생산성 앱
- 범위: 페이지 블록 편집과 SQLite/Prisma 기반 서버 저장 연결 완료
- 상태: 화면은 `PageRepository`를 통해 페이지를 읽고 쓰고, 서버 API는 Prisma 저장소를 통해 페이지와 블록을 SQLite에 저장함. 새 페이지 생성 중에는 편집과 페이지 전환을 잠가 대상 꼬임을 막음
- 운영: 컨텍스트 기준점은 `state/context-checklist.md`를 따라 관리
- 운영 보강: 알려진 이슈는 `state/known-issues.md`, QA 기록은 `state/qa-log.md`, 최근 메모는 `state/latest-work.md`, 이유 기록은 `state/decisions.md`에 남김
- 다음: 페이지 삭제 버튼 클릭 안정성 확인, 저장소 전환 전략 기준으로 다음 저장 단계 정리
