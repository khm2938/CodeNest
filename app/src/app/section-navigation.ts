import type { SidebarSectionId } from "@/components/app-sidebar";

const sectionIds: SidebarSectionId[] = ["dashboard", "pages", "prompts", "settings"];

export function resolveActiveSectionId(getSectionTop: (sectionId: SidebarSectionId) => number | null) {
  const threshold = 180;
  let nextSectionId: SidebarSectionId = "dashboard";

  for (const sectionId of sectionIds) {
    const top = getSectionTop(sectionId);
    if (top === null) {
      continue;
    }

    if (top <= threshold) {
      nextSectionId = sectionId;
    }
  }

  return nextSectionId;
}
