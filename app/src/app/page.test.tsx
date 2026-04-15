// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";
import { resolveActiveSectionId } from "./section-navigation";

describe("HomePage", () => {
  it("빠른 이동 버튼을 누르면 대상 섹션으로 스크롤한다", () => {
    const scrollIntoView = vi.fn();
    const getElementByIdSpy = vi.spyOn(document, "getElementById");

    getElementByIdSpy.mockReturnValue({
      scrollIntoView,
    } as unknown as HTMLElement);

    render(createElement(HomePage));

    fireEvent.click(screen.getByRole("button", { name: "페이지" }));

    expect(getElementByIdSpy).toHaveBeenCalledWith("pages");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });
});

describe("resolveActiveSectionId", () => {
  it("더 아래에 있는 섹션을 활성 섹션으로 고른다", () => {
    const activeSectionId = resolveActiveSectionId((sectionId) => {
      const positions: Record<string, number | null> = {
        dashboard: -240,
        pages: -120,
        prompts: 80,
        settings: 680,
      };

      return positions[sectionId];
    });

    expect(activeSectionId).toBe("prompts");
  });
});
