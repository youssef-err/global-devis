import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <section className="no-print rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 transition-shadow hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <header className="mb-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
