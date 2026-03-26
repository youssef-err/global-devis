'use client';

interface AffiliateLink {
  name: string;
  url: string;
  description: string;
  type?: 'tool' | 'resource';
}

interface AffiliateInlineLinkProps {
  tool: AffiliateLink;
  children: React.ReactNode;
}

export function AffiliateInlineLink({ tool, children }: AffiliateInlineLinkProps) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
    >
      {children}
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

interface AffiliateRecommendationsProps {
  title?: string;
  links: AffiliateLink[];
  className?: string;
}

export default function AffiliateRecommendations({
  title = 'Recommended Resources',
  links,
  className = ''
}: AffiliateRecommendationsProps) {
  return (
    <div className={`my-8 p-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl border border-indigo-100 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs text-indigo-600 uppercase tracking-wide font-medium">{title}</span>
      </div>
      <div className="space-y-3">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={`${link.name}: ${link.description}`}
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {link.name}
                </span>
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{link.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export const AFFILIATE_TOOLS = {
  wave: {
    name: 'Wave',
    url: 'https://www.waveapp.com/partner/affiliate?affiliate_id=YOUR_ID',
    description: 'Free accounting and invoicing software for small businesses',
    type: 'tool' as const
  },
  freshbooks: {
    name: 'FreshBooks',
    url: 'https://www.freshbooks.com/partner/affiliate?affiliate_id=YOUR_ID',
    description: 'Cloud accounting built for freelancers and self-employed professionals',
    type: 'tool' as const
  },
  quickbooks: {
    name: 'QuickBooks',
    url: 'https://quickbooks.intuit.com/partner/affiliate?affiliate_id=YOUR_ID',
    description: 'Complete accounting solution for small and medium businesses',
    type: 'tool' as const
  },
  xero: {
    name: 'Xero',
    url: 'https://www.xero.com/partner/affiliate?affiliate_id=YOUR_ID',
    description: 'Beautiful accounting software with unlimited users',
    type: 'tool' as const
  },
  zoho: {
    name: 'Zoho Invoice',
    url: 'https://www.zoho.com/partner/affiliate?affiliate_id=YOUR_ID',
    description: 'Create professional invoices and get paid faster',
    type: 'tool' as const
  },
  honeybook: {
    name: 'HoneyBook',
    url: 'https://www.honeybook.com/partner/affiliate?affiliate_id=YOUR_ID',
    description: 'All-in-one client management for creative businesses',
    type: 'tool' as const
  }
} as const;

export type AffiliateToolKey = keyof typeof AFFILIATE_TOOLS;
