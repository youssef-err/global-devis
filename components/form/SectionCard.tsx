import { ReactNode, memo } from 'react';

interface SectionCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default memo(function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <section className="no-print app-card">
      <header className="mb-6">
        <h2 className="app-title">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      </header>
      {children}
    </section>
  );
});
