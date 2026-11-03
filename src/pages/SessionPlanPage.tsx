import { useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FestivalNavbar } from '../components/FestivalNavbar';
import { TicketingProfileButton } from '../components/TicketingProfileButton';
import { buildCheckoutStateFromPackage } from '../lib/buildCheckoutState';
import { persistCheckoutBasket } from '../lib/checkoutFlowStorage';
import { computeServiceFee } from '../lib/checkoutState';
import { formatPrice } from '../lib/formatPrice';
import { FESTIVAL_EVENT_ID } from '../lib/festivalEvent';
import { persistHandoffPlan, readHandoffPlan } from '../lib/handoffPlanStorage';
import {
  DEMO_PACKAGE_ID,
  EVENT,
  formatCheckIn,
  getPackage,
} from '../lib/packages';
import { addonsPath, planPath } from '../lib/routes';
import './PlanPage.css';
import './SessionPlanPage.css';
import '../components/FestivalGallery.css';
import '../components/EntityCard.css';
import '../components/CartPanel.css';
import '../components/PlanFoldSection.css';

function getNavOverlayHeightPx() {
  const card = document.querySelector<HTMLElement>('.festivalNavbar');
  if (card) {
    const bottom = card.getBoundingClientRect().bottom;
    if (bottom > 0) return bottom;
  }
  return (
    document.querySelector<HTMLElement>('.planStickyNav')?.getBoundingClientRect()
      .height ?? 0
  );
}

/** Jump the viewport to the handed-off package (Gaerten ticket-section scroll). */
function scrollToPackage(behavior: ScrollBehavior = 'auto') {
  const target =
    document.getElementById('package') ?? document.getElementById('tickets');
  if (!target) return;
  const top = Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY - getNavOverlayHeightPx() - 12,
  );
  window.scrollTo({ top, left: 0, behavior });
}

function scheduleAutozoomToPackage() {
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    scrollToPackage('auto');
    document.getElementById('package')?.focus({ preventScroll: true });
  };
  const rafId = requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
  const timeoutId = window.setTimeout(run, 80);
  const lateId = window.setTimeout(run, 280);
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    window.clearTimeout(timeoutId);
    window.clearTimeout(lateId);
  };
}

function CartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <circle cx="9" cy="20.5" r="1.35" />
      <circle cx="18" cy="20.5" r="1.35" />
      <path
        d="M2.5 3.5h2.2l2.2 11.1a1.7 1.7 0 0 0 1.68 1.35h8.55a1.7 1.7 0 0 0 1.66-1.32L21.2 8H6.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 576 512" aria-hidden>
      <path
        fill="currentColor"
        d="M64 64C28.7 64 0 92.7 0 128v66c0 7.3 4.9 13.7 12 15.5c20.7 5.3 36 24.1 36 46.5s-15.3 41.2-36 46.5C4.9 304.3 0 310.7 0 318v66c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V318c0-7.3-4.9-13.7-12-15.5c-20.7-5.3-36-24.1-36-46.5s15.3-41.2 36-46.5c7.1-1.8 12-8.2 12-15.5V128c0-35.3-28.7-64-64-64H64z"
      />
    </svg>
  );
}

/**
 * Fever plan landing after 100x Buy Now.
 * Same marketplace shell as Gaerten PlanPage — one preselected package only.
 */
export function SessionPlanPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const packageId = params.get('package_id') ?? DEMO_PACKAGE_ID;
  const pkg = getPackage(packageId) ?? getPackage(DEMO_PACKAGE_ID)!;
  const saved = readHandoffPlan();
  const [qty, setQty] = useState(() =>
    saved.packageId === packageId ? saved.qty : 1,
  );

  // Phase 1 handoff: land already zoomed on the preselected package, not the hero.
  useLayoutEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash === 'package' || hash === 'session') {
      return scheduleAutozoomToPackage();
    }
    if (!window.location.hash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#package`,
      );
    }
    return scheduleAutozoomToPackage();
  }, [packageId]);

  const basket = useMemo(() => {
    const base = buildCheckoutStateFromPackage(pkg.id, []);
    if (!base) return null;
    const lines = base.lines.map((line) =>
      line.id === 'ticket' ? { ...line, amount: line.amount * qty } : line,
    );
    const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
    const serviceFee = computeServiceFee(subtotal);
    return {
      ...base,
      lines,
      subtotal,
      serviceFee,
      total: subtotal + serviceFee,
    };
  }, [pkg.id, qty]);

  const total = basket?.total ?? pkg.priceCents / 100;
  const itemCount = qty;

  const goAddons = () => {
    if (!basket) return;
    persistHandoffPlan({
      packageId: pkg.id,
      qty,
      addonQty: saved.packageId === pkg.id ? saved.addonQty : {},
    });
    persistCheckoutBasket(FESTIVAL_EVENT_ID, basket);
    navigate(addonsPath(FESTIVAL_EVENT_ID, pkg.id), { state: basket });
  };

  const scrollToTickets = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollToPackage(reduceMotion ? 'auto' : 'smooth');
  };

  const BASE = import.meta.env.BASE_URL;
  const grid = ['/room-1.webp', '/room-2.avif', '/cmp-hero.jpg', '/room-1.webp'];

  const cartBody = (
    <>
      <ul className="cartList">
        <li className="ticketCard">
          <div className="ticketInfo">
            <div className="ticketInfoTop">
              <p className="ticketPath">Packages › {pkg.sectionLabel}</p>
              <div className="ticketName">{pkg.name}</div>
            </div>
            <div className="ticketPriceBlock">
              <div className="ticketLineTotal">{formatPrice(total)}</div>
            </div>
          </div>
          <div className="ticketStub">
            <div className="cartQtyTheme cartQty" aria-label={`Quantity for ${pkg.name}`}>
              <button
                type="button"
                className="cartQtyBtnMinus"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="cartQtyValue">{qty}</span>
              <button
                type="button"
                className="cartQtyBtnPlus"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>
        </li>
      </ul>
    </>
  );

  const cartSummary = (
    <div className="cartSummary">
      <div className="cartSummaryMain">
        <span className="cartSummaryLabel">Total</span>
        <span className="cartSummaryTotal">{formatPrice(total)}</span>
      </div>
      <span className="cartSummaryTickets">Items: {itemCount}</span>
    </div>
  );

  const cartFooter = (
    <div className="cartFooter" aria-label="Cart summary and checkout">
      {cartSummary}
      <div className="cartCheckout cartCheckout--withBack">
        <button
          type="button"
          className="cartBackBtn"
          aria-label="Back"
          onClick={() => navigate(planPath())}
        >
          <BackArrowIcon />
        </button>
        <button type="button" className="cartCheckoutBtn" onClick={goAddons}>
          Continue
        </button>
      </div>
    </div>
  );

  return (
    <div className="planPage planPage--marketplace">
      <div className="planStickyNav">
        <FestivalNavbar
          variant="marketplace"
          profileSlot={
            <TicketingProfileButton eventId={FESTIVAL_EVENT_ID} size="md" />
          }
        />
      </div>

      <div className="planHeroSlot planHeroSlot--mediaHero planHeroSlot--immersive">
        <section className="festivalGalleryBand" aria-label="Event media">
          <div className="eventMediaHero eventMediaHero--immersive">
            <div className="eventMediaHero__main">
              <img
                className="eventMediaHero__video"
                src={`${import.meta.env.BASE_URL}cmp-hero.jpg`}
                alt=""
              />
              <div className="eventMediaHero__scrim" aria-hidden />
              <div className="eventMediaHero__overlay">
                <div className="eventMediaHero__overlayInner">
                  <div className="eventMediaHero__contentMain">
                    <div className="eventMediaHero__header">
                      <span className="eventMediaHero__tag">
                        <span className="eventMediaHero__tagA11y">Fever exclusive</span>
                        <span className="eventMediaHero__tagText">Only on</span>
                        <img
                          className="eventMediaHero__tagLogo"
                          src={`${BASE}fever-logo-white.svg`}
                          alt=""
                          aria-hidden
                        />
                      </span>
                      <h1 className="eventMediaHero__title">
                        <span className="eventMediaHero__titleText">{EVENT.title}</span>
                      </h1>
                    </div>
                    <div className="eventMediaHero__eventMeta">
                      <time className="eventMediaHero__eventDate" dateTime="2027-01-13">
                        13–16 Jan
                      </time>
                      <p className="eventMediaHero__venue">Moon Palace Cancún</p>
                    </div>
                    <div className="eventMediaHero__facts" aria-label="Package highlights">
                      <div className="eventMediaHero__factsTrack">
                        <ul className="eventMediaHero__factsSet">
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Nights</dt>
                              <dd className="eventMediaHero__factValue">{pkg.nights}</dd>
                            </dl>
                            <span className="eventMediaHero__factDivider" aria-hidden />
                          </li>
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Guests</dt>
                              <dd className="eventMediaHero__factValue">{pkg.guests}</dd>
                            </dl>
                            <span className="eventMediaHero__factDivider" aria-hidden />
                          </li>
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Check-in</dt>
                              <dd className="eventMediaHero__factValue">
                                {formatCheckIn(pkg.checkIn).replace(', 2027', '')}
                              </dd>
                            </dl>
                            <span className="eventMediaHero__factDivider" aria-hidden />
                          </li>
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Room</dt>
                              <dd className="eventMediaHero__factValue">Double</dd>
                            </dl>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="eventMediaHero__priceRow eventMediaHero__priceRow--bannered">
                    <div className="eventMediaHero__from">
                      <span className="eventMediaHero__fromLabel">Package</span>
                      <span className="eventMediaHero__fromPrice">
                        {formatPrice(pkg.priceCents / 100)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="eventMediaHero__buyBtn"
                      onClick={scrollToTickets}
                    >
                      View package
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {grid.map((src, index) => (
              <div key={`${src}-${index}`} className="eventMediaHero__cellWrap">
                <div className="eventMediaHero__cell">
                  <img className="eventMediaHero__img" src={src} alt="" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="planDesktopShell">
        <section id="tickets" className="planTicketsSection" aria-label="Package">
          <div className="planTickets">
            <h2 className="planFold__title">
              <span className="planFold__icon" aria-hidden>
                <TicketIcon />
              </span>
              <span>Your package</span>
            </h2>

            <p className="packagePlanHint">
              Preselected from 100x — this Fever view shows only your handed-off
              package.
            </p>

            <div className="planTicketsRail">
              <div className="planTicketsMain">
                <div className="planMainShell">
                  <div className="planMainColumn">
                    <div className="planContentColumn">
                      <article
                        id="package"
                        className="card cardAdmission packageCard packageCard--autozoom"
                        tabIndex={-1}
                      >
                        <div className="imageWrapper">
                          <img
                            className="image imageSinglePane"
                            src={`${import.meta.env.BASE_URL}room-1.webp`}
                            alt=""
                          />
                          <div className="imageTagsCorner">
                            <span className="entityListingTag">Selected package</span>
                          </div>
                        </div>
                        <div className="content">
                          <h3 className="title">{pkg.name}</h3>
                          <div className="priceRow">
                            <p className="price">{formatPrice(pkg.priceCents / 100)}</p>
                          </div>
                          <p className="metaLine">
                            {pkg.sectionLabel} · {pkg.roomType} · {pkg.nights} nights ·{' '}
                            {pkg.guests} guests
                          </p>
                          <p className="metaLine">
                            Check-in {formatCheckIn(pkg.checkIn)}
                          </p>
                          <ul className="benefits">
                            {pkg.includes.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>

              <div className="planTicketsCart">
                <aside className="planCartColumn" aria-label="Shopping cart">
                  <div className="cartPanelReveal">
                    <div className="cartPanel cartPanelFloat" role="complementary">
                      <div className="cartHeader">
                        <div className="cartHeaderTitleRow">
                          <span className="cartHeaderIcon">
                            <CartIcon />
                          </span>
                          <h2 className="cartTitle">Your cart</h2>
                        </div>
                      </div>
                      <div className="cartBody">{cartBody}</div>
                      {cartFooter}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        className="cartMobileBar cartMobileBar--openable cartMobileBar--withBack"
        role="region"
        aria-label="Cart actions"
      >
        <button
          type="button"
          className="cartMobileTrigger"
          aria-label={`Cart, ${itemCount} items, ${formatPrice(total)} total`}
          onClick={scrollToTickets}
        >
          <span className="cartMobileTriggerIconWrap" aria-hidden>
            <span className="cartMobileTriggerIcon">
              <CartIcon />
            </span>
            <span className="cartMobileTriggerBadge">{itemCount}</span>
          </span>
          <span className="cartMobileTriggerCopy">
            <span className="cartMobileTriggerPrice">{formatPrice(total)}</span>
            <span className="cartMobileTriggerTickets">Items: {itemCount}</span>
          </span>
        </button>
        <button
          type="button"
          className="cartMobileBackBtn"
          aria-label="Back"
          onClick={() => navigate(planPath())}
        >
          <BackArrowIcon />
        </button>
        <button
          type="button"
          className="cartMobileCheckoutPill"
          onClick={goAddons}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
