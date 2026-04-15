import type { ReactNode } from "react";

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SectionCard({ eyebrow, title, description, children }: SectionCardProps) {
  return (
    <section className="section-card">
      <div className="section-card__header">
        <span className="section-card__eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="section-card__body">{children}</div>
    </section>
  );
}

