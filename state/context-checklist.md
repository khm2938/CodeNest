# 컨텍스트 관리 체크리스트

CodeNest 작업을 이어갈 때 대화 요약보다 파일 기준을 우선하기 위한 체크리스트다.

## 작업 시작 전

- `state/current-state.md`를 읽고 현재 제품 상태를 먼저 맞춘다.
- `state/backlog.md`를 읽고 지금 할 일의 우선순위를 확인한다.
- `state/latest-work.md`를 읽고 가장 최근에 확인된 내용과 다음 진입 파일을 맞춘다.
- `state/known-issues.md`를 읽고 이미 확인된 버그를 다시 놓치지 않게 한다.
- 관련 구조 결정이 있으면 `docs/superpowers/specs/`의 해당 문서를 먼저 읽는다.
- 중요한 이유를 다시 확인해야 하면 `state/decisions.md`를 먼저 읽는다.
- 반복 지침이 필요하면 `prompts/`에서 필요한 템플릿만 불러온다.
- 실제 동작 기준은 대화 요약이 아니라 코드와 테스트라는 점을 다시 확인한다.

## 작업 중

- 새 의사결정이 나오면 대화에만 두지 말고 `docs/`나 `state/decisions.md`에 남긴다.
- 작업 범위가 바뀌면 `state/backlog.md`를 함께 갱신한다.
- 현재 구현 상태가 바뀌면 `state/current-state.md`를 함께 갱신한다.
- 버그를 발견하면 최소한 현재 깨진 흐름과 재현 조건을 파일에 남긴다.
- QA를 했다면 `state/qa-log.md`에 결과를 남긴다.
- 기능 설명보다 파일 경계, 저장 구조, 테스트 기준을 더 우선해서 기록한다.

## 작업 종료 전

- 코드와 테스트가 실제 기준 문서와 어긋나지 않는지 확인한다.
- 이번 작업으로 바뀐 구조가 있으면 `docs/superpowers/specs/`를 갱신한다.
- 다음 작업이 분명하면 `state/backlog.md`에 바로 적는다.
- 지금 시점의 제품 상태를 한 줄이라도 `state/current-state.md`에 반영한다.
- 대화에만 남아 있는 중요한 결정이나 QA 결과가 없는지 확인한다.
- 이번 세션에서 바로 이어갈 핵심 메모는 `state/latest-work.md`에 남긴다.

## 컨텍스트가 길어졌을 때

- 먼저 이 파일을 보고 기준 순서를 다시 맞춘다.
- 그다음 `state/current-state.md`, `state/backlog.md`, `state/latest-work.md`를 다시 읽는다.
- 버그나 QA 이력이 중요하면 `state/known-issues.md`와 `state/qa-log.md`를 다시 읽는다.
- 세부 설계가 필요하면 관련 `specs` 문서를 다시 연다.
- 기억이 애매하면 대화보다 코드와 테스트를 다시 읽는다.
- 요약이 불완전해 보여도 파일 기준이 최신이면 그대로 따른다.

## 기준 우선순위

1. 코드와 테스트
2. `docs/superpowers/specs/`
3. `state/current-state.md`
4. `state/known-issues.md`
5. `state/latest-work.md`
6. `state/backlog.md`
7. `state/decisions.md`
8. `state/qa-log.md`
9. `prompts/`
10. 대화 요약
