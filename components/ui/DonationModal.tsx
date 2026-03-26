'use client';

/* eslint-disable jsx-a11y/control-has-associated-label */

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  open: boolean;
  onClose: () => void;
}

type DonationOptionKey = 'buyMeACoffee' | 'kofi' | 'paypal';

const options: Array<{
  key: DonationOptionKey;
  href: string;
  color: string;
  icon: ReactNode;
}> = [
  {
    key: 'buyMeACoffee',
    href: 'https://buymeacoffee.com',
    color: 'bg-[#FFDD00] text-slate-900 hover:bg-[#f0ce00]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
        <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.077.015-.astronomical6.019-.217.026-.435.048-.652.07-1.165.114-2.338.185-3.51.159a26.09 26.09 0 01-3.942-.536c-.388-.085-.793-.2-1.166-.368-.155-.07-.3-.17-.437-.27-.24-.178-.519-.456-.522-.779 0-.126.012-.251.04-.374.047-.202.13-.395.213-.588.075-.174.099-.346-.021-.512-.118-.166-.288-.293-.457-.423-.227-.176-.37-.42-.462-.695-.111-.33-.023-.664.184-.94.222-.298.535-.52.854-.692.634-.343 1.31-.565 1.997-.725 1.4-.325 2.848-.37 4.282-.3.84.042 1.674.14 2.499.3.46.092.918.21 1.37.352.278.086.554.197.833.296a1.89 1.89 0 01.66.39c.207.19.348.449.418.723.049.194.05.395.023.592z" />
        <path d="M3.5 8.5h17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M5 8.5l1.5 10h11L19 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    key: 'kofi',
    href: 'https://ko-fi.com',
    color: 'bg-[#29ABE0] text-white hover:bg-[#2299c8]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682-.ិ1.682-.1v-4.637l1.482-.321s1.636 2.242-.085 5.084l.285-7z" />
      </svg>
    ),
  },
  {
    key: 'paypal',
    href: 'https://paypal.me',
    color: 'bg-[#0070BA] text-white hover:bg-[#005ea6]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.72a.771.771 0 01.76-.649h6.964c2.37 0 4.093.558 5.122 1.657 1.027 1.097 1.337 2.7.923 4.762-.044.218-.096.44-.157.667-.886 3.614-3.92 5.11-7.48 5.11H8.92c-.456 0-.842.329-.912.78l-.931 5.29zM8.93 14.82h1.056c2.186 0 3.925-.837 4.543-3.14.094-.356.126-.69.077-1.003-.254-1.624-1.495-2.26-3.547-2.26H9.922L8.93 14.82zm10.68-10.15c-.55-.6-1.406-1.01-2.64-1.2a13.84 13.84 0 00-2.05-.14h-5.8a.771.771 0 00-.76.649L6.12 16.48c-.072.432.257.824.697.824h3.117l.784-4.484-.025.142a.919.919 0 01.907-.785h1.883c3.712 0 6.614-1.508 7.46-5.871.037-.19.069-.374.095-.554.327-2.14-.113-3.576-1.43-4.083z" />
      </svg>
    ),
  },
];

export default function DonationModal({ open, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('Donation');

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

      {/* Modal */}
      <div className="animate-pop relative w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl ring-1 ring-slate-200/60">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Heading */}
        <div className="mb-6 text-center">
          <span className="text-3xl">❤️</span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">{t('title')}</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {options.map((opt) => (
            <a
              key={opt.key}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] hover:shadow-md ${opt.color}`}
            >
              {opt.icon}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(`options.${opt.key}` as any)}
            </a>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          {t('footnote')}
        </p>
      </div>
    </div>
  );
}
