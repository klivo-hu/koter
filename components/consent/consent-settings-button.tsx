'use client';

import { useConsent } from '@/components/consent/consent-provider';
import { cn } from '@/lib/cn';

/**
 * Reopens the cookie notice. Withdrawing consent has to be as easy as giving it,
 * so the way back is a permanent link in the footer rather than buried in a policy.
 */
export function ConsentSettingsButton({ className }: { className?: string }): React.JSX.Element {
  const { review } = useConsent();

  return (
    <button type="button" onClick={review} className={cn('text-left', className)}>
      Süti-beállítások
    </button>
  );
}
