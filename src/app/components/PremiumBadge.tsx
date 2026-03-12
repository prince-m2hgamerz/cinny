import React from 'react';
import * as css from './PremiumBadge.css';

type PremiumBadgeProps = css.PremiumBadgeVariants & {
  title?: string;
};

export function PremiumBadge({ size, title = 'Premium account' }: PremiumBadgeProps) {
  return (
    <span className={css.PremiumBadge({ size })} role="img" aria-label={title} title={title}>
      <svg className={css.Icon} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="premium-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#5ba9ff" />
            <stop offset="45%" stopColor="#4f7cff" />
            <stop offset="100%" stopColor="#9f7bff" />
          </linearGradient>
        </defs>
        <path
          fill="url(#premium-gradient)"
          d="M24 3.5l6.4 13.1 14.5 2.1-10.5 10.2 2.5 14.4L24 36.9 11.1 43.3l2.5-14.4L3.1 18.7l14.5-2.1L24 3.5z"
        />
        <path
          fill="rgba(255, 255, 255, 0.85)"
          d="M24 11.2l4.1 8.4 9.3 1.3-6.7 6.5 1.6 9.2L24 32.6l-8.3 4.1 1.6-9.2-6.7-6.5 9.3-1.3L24 11.2z"
        />
      </svg>
    </span>
  );
}
