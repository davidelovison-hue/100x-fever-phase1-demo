import type { ReactNode } from 'react';
import './PlanFoldSection.css';

type PlanFoldSectionProps = {
  id: string;
  title: string;
  icon: 'compass' | 'ticket';
  open: boolean;
  onToggle: () => void;
  className?: string;
  peekWhenCollapsed?: boolean;
  children: ReactNode;
};

function CompassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 512 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm92.6-389.1L202.1 171.8c-14.3 4.8-25.6 16-30.4 30.4L122.9 348.6c-8.3 25 15.5 48.8 40.5 40.5l146.5-48.8c14.3-4.8 25.6-16 30.4-30.4l48.8-146.5c8.3-25-15.5-48.8-40.5-40.5zm10.1 30.4L309.9 299.8c-1.6 4.8-5.3 8.5-10.1 10.1L153.3 358.7l48.8-146.5c1.6-4.8 5.3-8.5 10.1-10.1l146.5-48.8zM256 280a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"
      />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 576 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M64 64C28.7 64 0 92.7 0 128v66c0 7.3 4.9 13.7 12 15.5c20.7 5.3 36 24.1 36 46.5s-15.3 41.2-36 46.5C4.9 304.3 0 310.7 0 318v66c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V318c0-7.3-4.9-13.7-12-15.5c-20.7-5.3-36-24.1-36-46.5s15.3-41.2 36-46.5c7.1-1.8 12-8.2 12-15.5V128c0-35.3-28.7-64-64-64H64zM32 128c0-17.7 14.3-32 32-32H512c17.7 0 32 14.3 32 32v54.7c-28.2 12.3-48 40.5-48 73.3s19.8 61 48 73.3V384c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V329.3C60.2 317 80 288.8 80 256s-19.8-61-48-73.3V128zm128 64H416V320H160V192zm-32 0V320c0 17.7 14.3 32 32 32H416c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32H160c-17.7 0-32 14.3-32 32z"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 512 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z"
      />
    </svg>
  );
}

export function PlanSectionTitle({
  icon,
  children,
}: {
  icon: 'compass' | 'ticket';
  children: ReactNode;
}) {
  return (
    <h2 className="planFold__title">
      <span className="planFold__icon" aria-hidden="true">
        {icon === 'ticket' ? <TicketIcon /> : <CompassIcon />}
      </span>
      <span>{children}</span>
    </h2>
  );
}

export function PlanFoldSection({
  id,
  title,
  icon,
  open,
  onToggle,
  className,
  peekWhenCollapsed = false,
  children,
}: PlanFoldSectionProps) {
  const panelId = `${id}-region`;
  const collapsedHidden = !open && !peekWhenCollapsed;
  const showHeaderToggle = open || !peekWhenCollapsed;

  return (
    <section
      id={id}
      className={`planFold${open ? ' planFold--open' : ''}${peekWhenCollapsed ? ' planFold--peek' : ''}${className ? ` ${className}` : ''}`}
      aria-label={title}
    >
      <div className="planFold__header" onClick={onToggle}>
        <PlanSectionTitle icon={icon}>{title}</PlanSectionTitle>
        {showHeaderToggle ? (
          <button
            type="button"
            className="planFold__toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            <span>{open ? 'See less' : 'See more'}</span>
            <span className="planFold__toggleIcon">
              <ChevronIcon />
            </span>
          </button>
        ) : null}
      </div>
      <div
        id={panelId}
        className={`planFold__region${collapsedHidden ? ' planFold__region--collapsed' : ''}`}
      >
        <div
          className="planFold__inner"
          ref={(el) => {
            if (el) el.inert = collapsedHidden;
          }}
        >
          {children}
        </div>
      </div>
      {peekWhenCollapsed && !open ? (
        <div className="planFold__seeMoreRow">
          <button
            type="button"
            className="planFold__toggle"
            aria-expanded={false}
            aria-controls={panelId}
            onClick={onToggle}
          >
            <span>See more</span>
            <span className="planFold__toggleIcon">
              <ChevronIcon />
            </span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
