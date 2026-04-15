import type { PromptGroup } from "@/lib/types";

export const promptGroups: PromptGroup[] = [
  {
    title: "핵심",
    description: "프로젝트 규칙과 기능 정의",
    items: [
      { name: "프로젝트 마스터", path: "prompts/10-core/11-project-master.md" },
      { name: "기능 설계", path: "prompts/10-core/12-feature-design.md" },
      { name: "기능 분해", path: "prompts/10-core/13-feature-breakdown.md" },
      { name: "우선순위", path: "prompts/10-core/14-priority.md" },
    ],
  },
  {
    title: "설계",
    description: "흐름, 데이터, 계약, MVP 판단",
    items: [
      { name: "사용자 흐름", path: "prompts/20-planning/21-user-flow.md" },
      { name: "컴포넌트 분해", path: "prompts/20-planning/22-component-breakdown.md" },
      { name: "데이터 모델", path: "prompts/20-planning/23-data-model.md" },
      { name: "계약", path: "prompts/20-planning/24-contracts.md" },
      { name: "테스트", path: "prompts/20-planning/25-testing.md" },
      { name: "MVP 절단", path: "prompts/20-planning/26-mvp-cut.md" },
    ],
  },
  {
    title: "실행",
    description: "구현, 리뷰, 문서화, 확장 판단",
    items: [
      { name: "구현", path: "prompts/30-execution/31-implementation.md" },
      { name: "리뷰와 QA", path: "prompts/30-execution/32-review-qa.md" },
      { name: "문서화", path: "prompts/30-execution/33-documentation.md" },
      { name: "구현 방식 비교", path: "prompts/30-execution/34-architecture-comparison.md" },
      { name: "확장 판단", path: "prompts/30-execution/35-expansion-decision.md" },
    ],
  },
];
