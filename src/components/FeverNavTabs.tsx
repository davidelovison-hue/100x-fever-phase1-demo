import { useEffect, useRef, useState } from 'react';
import './FeverNavTabs.css';

export type FeverNavTab = {
  id: string;
  label: string;
};

type FeverNavTabsProps = {
  tabs: FeverNavTab[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  getTabDomId?: (id: string) => string;
  variant?: 'line' | 'pill' | 'bar';
  showActions?: boolean;
};

export function FeverNavTabs({
  tabs,
  activeId,
  onSelect,
  ariaLabel,
  getTabDomId,
  variant = 'line',
  showActions = false,
}: FeverNavTabsProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    const scroll = scrollRef.current;
    const indicator = indicatorRef.current;
    if (!bar || !indicator) return;

    const active = bar.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`);
    if (!active) return;

    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft - (scroll?.scrollLeft ?? 0)}px)`;

    if (!scroll || scroll.scrollWidth <= scroll.clientWidth + 1) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    active.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeId, tabs]);

  return (
    <nav
      className={`fvNavTabs${variant === 'pill' ? ' fvNavTabs--pill' : ''}${variant === 'bar' ? ' fvNavTabs--bar' : ''}`}
      aria-label={ariaLabel}
    >
      <div className="fvNavTabs__bar" ref={barRef}>
        <div className="fvNavTabs__scroll" ref={scrollRef} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeId === tab.id}
              id={getTabDomId?.(tab.id)}
              data-nav-id={tab.id}
              className={`fvNavTabs__tab${activeId === tab.id ? ' fvNavTabs__tab--active' : ''}`}
              onClick={() => onSelect(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <span className="fvNavTabs__indicator" ref={indicatorRef} aria-hidden="true" />
        {showActions ? (
          <div className="fvNavTabs__actions">
            <span className="fvNavTabs__actionsDivider" aria-hidden="true" />
            <button
              type="button"
              className={`fvNavTabs__action${saved ? ' fvNavTabs__action--on' : ''}`}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from saved' : 'Save experience'}
              onClick={() => setSaved((value) => !value)}
            >
              <svg width="18" height="18" viewBox="0 0 512 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d={
                    saved
                      ? 'M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z'
                      : 'M225.8 468.2l-2.5-2.3L48.1 303.2C17.2 274.7 0 234.7 0 192.8v-3.3c0-70.4 50.7-131.1 119.4-141.6C162 38 207.9 53.7 236 86.2l20 23.1 20-23.1c28.1-32.5 74-48.2 116.6-38.3C461.3 58.4 512 119.1 512 189.5v3.3c0 41.9-17.2 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-12.9-14.9-32.3-23.5-52.6-23.5-38.2 0-69.3 31.1-69.3 69.3v.4c0 20.2 8.5 39.3 23.3 53.2L256 414.1 371.5 244.4c14.8-13.9 23.3-33 23.3-53.2v-.4c0-38.2-31.1-69.3-69.3-69.3-20.3 0-39.7 8.6-52.6 23.5L256 181.5 239.1 145z'
                  }
                />
              </svg>
            </button>
            <button
              type="button"
              className="fvNavTabs__action"
              aria-label="Share"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  void navigator.share({ title: document.title, url });
                  return;
                }
                void navigator.clipboard.writeText(url);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M12 4v12M8.5 8.5 12 5l3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
