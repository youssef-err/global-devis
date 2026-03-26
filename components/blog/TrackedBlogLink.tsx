'use client';

import Link from 'next/link';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

interface TrackedBlogLinkProps {
  href: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}

export default function TrackedBlogLink({ href, title, className, children }: TrackedBlogLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent(AnalyticsEvents.BLOG_CLICK, { slug: href, title })}
    >
      {children}
    </Link>
  );
}

