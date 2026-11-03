import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FEVER_WHITELABEL_MARK_SRC,
  FESTIVAL_EVENT_ID,
  FESTIVAL_EVENT,
  FESTIVAL_LOGO_SRC,
} from '../lib/festivalEvent';
import { resetHandoffPlanSelection } from '../lib/handoffPlanStorage';
import { FORCED_STEPPER_PATH, isForcedStepperPath } from '../lib/routes';
import { scrollPageToTop } from '../lib/scrollPageToTop';
import { TicketingProfileButton } from './TicketingProfileButton';
import './FestivalNavbar.css';

type FestivalNavbarProps = {
  profileSlot?: ReactNode;
  variant?: 'dark' | 'marketplace';
};

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 384 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
      />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12.1 20.3 4.8 13c-1.9-1.9-1.9-5 0-6.9 1.9-1.9 5-1.9 6.9 0l.4.4.4-.4c1.9-1.9 5-1.9 6.9 0 1.9 1.9 1.9 5 0 6.9l-7.3 7.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FestivalNavbar({ profileSlot, variant = 'dark' }: FestivalNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const profileControl =
    profileSlot ?? (
      <TicketingProfileButton eventId={FESTIVAL_EVENT_ID} size="md" className="festivalNavbarProfileSlot" />
    );

  const goToLandingTop = () => {
    const home =
      location.pathname === '/scroll'
        ? '/scroll'
        : location.pathname === '/immersive'
          ? '/immersive'
          : isForcedStepperPath(location.pathname)
            ? FORCED_STEPPER_PATH
            : '/';
    if (home === '/') {
      resetHandoffPlanSelection();
    }
    navigate(home);
    scrollPageToTop();
  };

  const isMarketplace = variant === 'marketplace';
  const logoSrc = isMarketplace ? `${import.meta.env.BASE_URL}fever-logo-black.svg` : FESTIVAL_LOGO_SRC;
  const logoAlt = isMarketplace ? 'fever' : FESTIVAL_EVENT.title;

  return (
    <header className={`festivalNavbar${isMarketplace ? ' festivalNavbar--marketplace' : ''}`}>
      <div className="festivalNavbarInner">
        <div className="leftCluster">
          <button
            type="button"
            className="logo logoButton"
            aria-label={`${FESTIVAL_EVENT.title} — home`}
            onClick={goToLandingTop}
          >
            <img
              className={`logoImg${isMarketplace ? ' logoImg--fever' : ' logoImg--photo'}`}
              src={logoSrc}
              alt={logoAlt}
              width={isMarketplace ? 92 : 160}
              height={isMarketplace ? 28 : 58}
              decoding="async"
            />
          </button>
          {!isMarketplace ? (
            <span className="whitelabelFeverMark" title="Powered by Fever">
              <span>on</span>
              <img
                src={FEVER_WHITELABEL_MARK_SRC}
                alt="Fever"
                width={56}
                height={14}
                decoding="async"
              />
            </span>
          ) : null}
        </div>

        {isMarketplace ? (
          <>
            <button type="button" className="marketplaceNavLink">
              <PinIcon />
              <span>Cancún</span>
            </button>
            <span className="marketplaceNavDivider" aria-hidden="true" />
            <button type="button" className="marketplaceNavLink">
              <CategoriesIcon />
              <span>Categories</span>
            </button>
            <div className="marketplaceSearchWrap">
              <label className="marketplaceSearch">
                <span className="marketplaceSearch__icon">
                  <SearchIcon />
                </span>
                <input
                  className="marketplaceSearch__input"
                  type="search"
                  placeholder="What do you want to do?"
                  aria-label="What do you want to do?"
                />
              </label>
            </div>
          </>
        ) : null}

        <div className="actionsDesktop">
          <button type="button" className="iconBtn" aria-label="Language">
            <span className="globe">
              <GlobeIcon />
            </span>
            EN
          </button>
          {isMarketplace ? (
            <button type="button" className="iconBtnOnly marketplaceHeartBtn" aria-label="Saved">
              <HeartIcon />
            </button>
          ) : (
            <span className="vRuleActions" aria-hidden="true" />
          )}
          {isMarketplace ? (
            <span className="marketplaceSignIn">{profileControl}</span>
          ) : (
            <span className="festivalNavbarProfileSlot">{profileControl}</span>
          )}
        </div>

        <div className="actionsMobile" role="toolbar" aria-label="Quick actions">
          <span className="festivalNavbarProfileSlot">{profileControl}</span>
          <button type="button" className="iconBtnMobile" aria-label="Open menu">
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
