import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AddonEntityCard } from '../components/AddonEntityCard';
import { FestivalNavbar } from '../components/FestivalNavbar';
import { GroupCarousel } from '../components/GroupCarousel';
import { PlanSectionTitle } from '../components/PlanFoldSection';
import { PlanTabs } from '../components/PlanTabs';
import { TicketDetailsSheet } from '../components/TicketDetailsSheet';
import { TicketingProfileButton } from '../components/TicketingProfileButton';
import {
  DEFAULT_HANDOFF_STEP,
  getHandoffStepFromHash,
  getHandoffStepIndex,
  HANDOFF_STEPS,
  type HandoffStepId,
} from '../data/handoffPlanSteps';
import { buildCheckoutStateFromPackage } from '../lib/buildCheckoutState';
import { persistCheckoutBasket } from '../lib/checkoutFlowStorage';
import { computeServiceFee } from '../lib/checkoutState';
import { formatPrice } from '../lib/formatPrice';
import { FESTIVAL_EVENT_ID } from '../lib/festivalEvent';
import {
  persistHandoffPlan,
  readHandoffPlan,
} from '../lib/handoffPlanStorage';
import {
  ADDON_CATEGORY_LABEL,
  ADDONS,
  DEMO_PACKAGE_ID,
  EVENT,
  findPurchasableAddon,
  formatCheckIn,
  getPackage,
  type AddonCategory,
} from '../lib/packages';
import { connectPath, planPath, rememberPlanOrigin } from '../lib/routes';
import { useIsMobile } from '../lib/useIsMobile';
import './PlanPage.css';
import './SessionPlanPage.css';
import './AddonsPlanPage.css';
import '../components/FestivalGallery.css';
import '../components/EntityCard.css';
import '../components/CartPanel.css';
import '../components/PlanFoldSection.css';
import '../components/PlanCategorySection.css';

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

const CATEGORY_ORDER: AddonCategory[] = [
  'experience',
  'merch',
];

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

/**
 * Fever plan after 100x Buy Now — baseline = Gaerten marketplace PlanPage
 * (https://davidelovison-hue.github.io/gaerten/): marketplace nav, media hero,
 * Tickets + pill stepper tabs, cart rail. CMP whitelabel colors on Fever chrome.
 */
export function HandoffPlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [params] = useSearchParams();
  const saved = readHandoffPlan();
  const packageId =
    params.get('package_id') ?? saved.packageId ?? DEMO_PACKAGE_ID;
  const pkg = getPackage(packageId) ?? getPackage(DEMO_PACKAGE_ID)!;
  const fromFinder =
    Boolean((location.state as { fromFinder?: boolean } | null)?.fromFinder) ||
    params.has('package_id');

  const [activeTab, setActiveTab] = useState<HandoffStepId>(() =>
    typeof window !== 'undefined'
      ? getHandoffStepFromHash(window.location.hash || '#package')
      : DEFAULT_HANDOFF_STEP,
  );
  const [navScrolled, setNavScrolled] = useState(false);
  const [qty, setQty] = useState(() =>
    fromFinder ? 1 : saved.packageId === packageId ? saved.qty : 1,
  );
  const [addonQty, setAddonQty] = useState<Record<string, number>>(() =>
    fromFinder ? {} : saved.packageId === packageId ? saved.addonQty : {},
  );
  const [packageDetailsOpen, setPackageDetailsOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    if (!cartDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cartDrawerOpen]);

  const stepIndex = getHandoffStepIndex(activeTab);
  const isLastStep = stepIndex >= HANDOFF_STEPS.length - 1;
  const BASE = import.meta.env.BASE_URL;
  const grid = [
    `${BASE}room-1.webp`,
    `${BASE}room-2.avif`,
    `${BASE}cmp-hero.jpg`,
    `${BASE}room-1.webp`,
  ];

  const persist = useCallback(
    (nextAddons = addonQty, nextQty = qty) => {
      persistHandoffPlan({
        packageId: pkg.id,
        qty: nextQty,
        addonQty: nextAddons,
      });
    },
    [addonQty, pkg.id, qty],
  );

  const fullBasket = useMemo(() => {
    const base = buildCheckoutStateFromPackage(pkg.id, addonQty);
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
  }, [pkg.id, addonQty, qty]);

  const selectedAddons = Object.entries(addonQty)
    .filter(([, q]) => q > 0)
    .flatMap(([id, q]) => {
      const item = findPurchasableAddon(id);
      if (!item) return [];
      return [
        {
          id,
          qty: q,
          name: item.name,
          priceCents: item.priceCents * q,
          path: 'Add-ons',
        },
      ];
    });
  const packageAmount = (pkg.priceCents / 100) * qty;
  const addonsAmount = selectedAddons.reduce(
    (sum, a) => sum + a.priceCents / 100,
    0,
  );
  const total =
    activeTab === 'package' ? packageAmount : packageAmount + addonsAmount;
  const addonItemCount = selectedAddons.reduce((sum, a) => sum + a.qty, 0);
  const itemCount = activeTab === 'package' ? qty : qty + addonItemCount;

  useEffect(() => {
    rememberPlanOrigin(window.location.pathname);
  }, []);

  useEffect(() => {
    const sync = () => setNavScrolled(window.scrollY > 24);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);

  const goToStep = useCallback(
    (stepId: HandoffStepId) => {
      setActiveTab(stepId);
      const nextHash = `#${stepId}`;
      const url = `${window.location.pathname}${window.location.search}${nextHash}`;
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, '', url);
      }
      persist();
    },
    [persist],
  );

  useLayoutEffect(() => {
    const sync = () =>
      setActiveTab(getHandoffStepFromHash(window.location.hash));
    // Finder Buy Now must land on package step (hash can be dropped by some navigations).
    const desiredHash =
      fromFinder || params.has('package_id')
        ? '#package'
        : `#${DEFAULT_HANDOFF_STEP}`;
    if (!window.location.hash || (fromFinder && window.location.hash === '#addons')) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${desiredHash}`,
      );
    }
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, [fromFinder, params]);

  useLayoutEffect(() => {
    if (activeTab !== 'package') return;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      // Prefer tickets fold so title + notice + package sit under the nav (not mid-hero).
      const target =
        document.getElementById('tickets') ??
        document.getElementById('package');
      if (!target) return;
      const navH = getNavOverlayHeightPx();
      // Fixed nav offset only — using tabs.getBoundingClientRect().bottom scrolled too little.
      const offset = navH + 8;
      const top = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - offset,
      );
      window.scrollTo({ top, left: 0, behavior: 'auto' });
      document.getElementById('package')?.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(run));
    const timers = [50, 120, 280, 500].map((ms) => window.setTimeout(run, ms));
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [activeTab, packageId, location.key, fromFinder]);

  const setAddonQuantity = (id: string, nextQty: number) => {
    setAddonQty((prev) => {
      const next = { ...prev };
      if (nextQty <= 0) delete next[id];
      else next[id] = nextQty;
      persist(next, qty);
      return next;
    });
  };

  const goConnect = () => {
    if (!fullBasket) return;
    persist(addonQty, qty);
    persistCheckoutBasket(FESTIVAL_EVENT_ID, fullBasket);
    navigate(connectPath(FESTIVAL_EVENT_ID), { state: fullBasket });
  };

  const handleContinue = () => {
    if (!isLastStep) {
      goToStep('addons');
      return false;
    }
    goConnect();
    return true;
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      goToStep('package');
      return;
    }
    navigate(planPath());
  };

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: ADDON_CATEGORY_LABEL[category],
    items: ADDONS.filter((a) => a.category === category),
  })).filter((g) => g.items.length > 0);

  const cartList = (
    <ul className="cartList">
      <li className="ticketCard">
        <div className="ticketInfo">
          <div className="ticketInfoTop">
            <p className="ticketPath">Packages › {pkg.sectionLabel}</p>
            <div className="ticketName">{pkg.name}</div>
          </div>
          <div className="ticketPriceBlock">
            <div className="ticketLineTotal">{formatPrice(packageAmount)}</div>
          </div>
        </div>
        {activeTab === 'package' ? (
          <div className="ticketStub">
            <div
              className="cartQtyTheme cartQty"
              aria-label={`Quantity for ${pkg.name}`}
            >
              <button
                type="button"
                className="cartQtyBtnMinus"
                disabled={qty <= 1}
                onClick={() => {
                  const next = Math.max(1, qty - 1);
                  setQty(next);
                  persist(addonQty, next);
                }}
              >
                −
              </button>
              <span className="cartQtyValue">{qty}</span>
              <button
                type="button"
                className="cartQtyBtnPlus"
                onClick={() => {
                  const next = qty + 1;
                  setQty(next);
                  persist(addonQty, next);
                }}
              >
                +
              </button>
            </div>
          </div>
        ) : null}
      </li>
      {activeTab === 'addons'
        ? selectedAddons.map((addon) => (
            <li key={addon.id} className="ticketCard">
              <div className="ticketInfo">
                <div className="ticketInfoTop">
                  <p className="ticketPath">{addon.path}</p>
                  <div className="ticketName">{addon.name}</div>
                </div>
                <div className="ticketPriceBlock">
                  <div className="ticketLineTotal">
                    {formatPrice(addon.priceCents / 100)}
                  </div>
                </div>
              </div>
              <div className="ticketStub">
                <div
                  className="cartQtyTheme cartQty"
                  aria-label={`Quantity for ${addon.name}`}
                >
                  <button
                    type="button"
                    className="cartQtyBtnMinus"
                    onClick={() =>
                      setAddonQuantity(addon.id, Math.max(0, addon.qty - 1))
                    }
                  >
                    −
                  </button>
                  <span className="cartQtyValue">{addon.qty}</span>
                  <button
                    type="button"
                    className="cartQtyBtnPlus"
                    onClick={() => setAddonQuantity(addon.id, addon.qty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          ))
        : null}
    </ul>
  );

  const cartHeader = (
    <div className="cartHeader">
      <div className="cartHeaderTitleRow">
        <span className="cartHeaderIcon">
          <CartIcon />
        </span>
        <h2 className="cartTitle">Your cart</h2>
      </div>
    </div>
  );

  const showBack = stepIndex > 0;

  const checkoutRow = (
    <div
      className={
        showBack ? 'cartCheckout cartCheckout--withBack' : 'cartCheckout'
      }
    >
      {showBack ? (
        <button
          type="button"
          className="cartBackBtn"
          aria-label="Back"
          onClick={handleBack}
        >
          <BackArrowIcon />
        </button>
      ) : null}
      <button type="button" className="cartCheckoutBtn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );

  const cartFooter = (
    <div className="cartFooter" aria-label="Cart summary and checkout">
      <div className="cartSummary">
        <div className="cartSummaryMain">
          <span className="cartSummaryLabel">Total</span>
          <span className="cartSummaryTotal">{formatPrice(total)}</span>
        </div>
        <span className="cartSummaryTickets">Items: {itemCount}</span>
      </div>
      {checkoutRow}
    </div>
  );

  const desktopCart = (
    <aside className="planCartColumn" aria-label="Shopping cart">
      <div className="cartPanelReveal">
        <div className="cartPanel cartPanelFloat" role="complementary">
          {cartHeader}
          <div className="cartBody">{cartList}</div>
          {cartFooter}
        </div>
      </div>
    </aside>
  );

  const closeCartDrawer = () => setCartDrawerOpen(false);

  const mobileCart = createPortal(
    <>
      {cartDrawerOpen ? (
        <>
          <button
            type="button"
            className="cartMobileBackdrop"
            aria-label="Close cart"
            onClick={closeCartDrawer}
          />
          <div
            className="cartMobileDrawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
          >
            <div className="cartPanel cartMobileDrawerPanel">
              <div className="cartHeader">
                <div className="cartHeaderTitleRow">
                  <span className="cartHeaderIcon">
                    <CartIcon />
                  </span>
                  <h2 className="cartTitle">Your cart</h2>
                  <button
                    type="button"
                    className="cartDrawerCloseBtn"
                    aria-label="Close cart"
                    onClick={closeCartDrawer}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="cartBody cartMobileDrawerBody">{cartList}</div>
              <div className="cartFooter" aria-label="Cart summary and checkout">
                <div className="cartSummary">
                  <div className="cartSummaryMain">
                    <span className="cartSummaryLabel">Total</span>
                    <span className="cartSummaryTotal">{formatPrice(total)}</span>
                  </div>
                  <span className="cartSummaryTickets">Items: {itemCount}</span>
                </div>
                <div
                  className={
                    showBack
                      ? 'cartCheckout cartCheckout--withBack'
                      : 'cartCheckout'
                  }
                >
                  {showBack ? (
                    <button
                      type="button"
                      className="cartBackBtn"
                      aria-label="Back"
                      onClick={() => {
                        closeCartDrawer();
                        handleBack();
                      }}
                    >
                      <BackArrowIcon />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="cartCheckoutBtn"
                    onClick={() => {
                      closeCartDrawer();
                      handleContinue();
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
      <div
        className={
          showBack
            ? 'cartMobileBar cartMobileBar--openable cartMobileBar--withBack'
            : 'cartMobileBar cartMobileBar--openable'
        }
        role="region"
        aria-label="Cart actions"
      >
        <button
          type="button"
          className="cartMobileTrigger"
          aria-label={`Cart, ${itemCount} items, ${formatPrice(total)} total. Open cart.`}
          aria-expanded={cartDrawerOpen}
          onClick={() => setCartDrawerOpen(true)}
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
        {showBack ? (
          <button
            type="button"
            className="cartMobileBackBtn"
            aria-label="Back"
            onClick={handleBack}
          >
            <BackArrowIcon />
          </button>
        ) : null}
        <button
          type="button"
          className="cartMobileCheckoutPill"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </>,
    document.body,
  );

  return (
    <div
      className={`planPage planPage--marketplace${navScrolled ? ' planPage--navScrolled' : ''}`}
    >
      <div className="planStickyNav">
        <FestivalNavbar
          variant="dark"
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
                src={`${BASE}cmp-hero.jpg`}
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
                        <span className="eventMediaHero__titleText">
                          {EVENT.title}
                        </span>
                      </h1>
                    </div>
                    <div className="eventMediaHero__eventMeta">
                      <time
                        className="eventMediaHero__eventDate"
                        dateTime="2027-01-13"
                      >
                        13–16 Jan
                      </time>
                      <p className="eventMediaHero__venue">Moon Palace Cancún</p>
                    </div>
                    <div
                      className="eventMediaHero__facts"
                      aria-label="Event highlights"
                    >
                      <div className="eventMediaHero__factsTrack">
                        <ul className="eventMediaHero__factsSet">
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Dates</dt>
                              <dd className="eventMediaHero__factValue">
                                Jan 13–16
                              </dd>
                            </dl>
                            <span
                              className="eventMediaHero__factDivider"
                              aria-hidden
                            />
                          </li>
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Where</dt>
                              <dd className="eventMediaHero__factValue">
                                Riviera Cancún
                              </dd>
                            </dl>
                            <span
                              className="eventMediaHero__factDivider"
                              aria-hidden
                            />
                          </li>
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Vibe</dt>
                              <dd className="eventMediaHero__factValue">
                                Country music
                              </dd>
                            </dl>
                            <span
                              className="eventMediaHero__factDivider"
                              aria-hidden
                            />
                          </li>
                          <li className="eventMediaHero__fact">
                            <dl className="eventMediaHero__factCopy">
                              <dt className="eventMediaHero__factLabel">Stay</dt>
                              <dd className="eventMediaHero__factValue">
                                All-inclusive
                              </dd>
                            </dl>
                          </li>
                        </ul>
                      </div>
                    </div>
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
        <section id="tickets" className="planTicketsSection" aria-label="Tickets">
          <div className="planTickets">
            <PlanSectionTitle icon="ticket">Tickets</PlanSectionTitle>
            <p className="handoffPreselectLine" role="note">
              <span className="handoffPreselectLine__icon" aria-hidden>
                i
              </span>
              <span>
                Package preselected from the 100x website — continue here to add
                extras and pay. To change dates or package, go back to the 100x
                website.
              </span>
            </p>
            <div className="planTicketsRail">
              <div className="planTicketsMain">
                <div className="planTabsScrollAnchor" aria-hidden="true" />
                <div className="planTabsSlot">
                  <PlanTabs activeTab={activeTab} onTabChange={goToStep} />
                </div>
                <div className="planMainShell">
                  <div className="planMainColumn">
                    <div className="planContentColumn">
                      {activeTab === 'package' ? (
                        <div className="groupBlock">
                          <div className="groupCarouselOuter">
                            <div className="groupCarouselSingle">
                              <div className="carouselSlidePair">
                                <div className="carouselSlideInner">
                                  <article
                                    id="package"
                                    className="card cardAdmission packageCard packageCard--autozoom"
                                    tabIndex={-1}
                                  >
                                    <div className="imageWrapper">
                                      <div className="imageSinglePane">
                                        <img
                                          className="image"
                                          src={`${BASE}room-1.webp`}
                                          alt=""
                                        />
                                      </div>
                                    </div>
                                    <div className="content">
                                      <div className="lead">
                                        <div className="header">
                                          <h3 className="title">{pkg.roomType}</h3>
                                        </div>
                                        <div className="cardConfigSubtextSlot">
                                          <p className="description">
                                            {pkg.nights} nights · {pkg.guests}{' '}
                                            guests. Check-in{' '}
                                            {formatCheckIn(pkg.checkIn)}.
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          className="cardSeeMore"
                                          onClick={() =>
                                            setPackageDetailsOpen(true)
                                          }
                                        >
                                          See more{' '}
                                          <span aria-hidden="true">›</span>
                                        </button>
                                      </div>
                                      <div className="footer footerWithSeeMore">
                                        <div className="priceRowWithStepper">
                                          <div className="price">
                                            <span className="priceAmount">
                                              {formatPrice(pkg.priceCents / 100)}
                                            </span>
                                          </div>
                                          <div
                                            className="qty"
                                            aria-label={`Quantity for ${pkg.roomType}`}
                                          >
                                            <button
                                              type="button"
                                              className="qtyBtnMinus"
                                              aria-label="Decrease quantity"
                                              disabled={qty <= 1}
                                              onClick={() => {
                                                const next = Math.max(1, qty - 1);
                                                setQty(next);
                                                persist(addonQty, next);
                                              }}
                                            >
                                              −
                                            </button>
                                            <span className="qtyValue">{qty}</span>
                                            <button
                                              type="button"
                                              className="qtyBtnPlus"
                                              aria-label="Increase quantity"
                                              onClick={() => {
                                                const next = qty + 1;
                                                setQty(next);
                                                persist(addonQty, next);
                                              }}
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <TicketDetailsSheet
                                      open={packageDetailsOpen}
                                      title={pkg.roomType}
                                      items={pkg.includes}
                                      packageDetails={pkg.details}
                                      priceLabel={formatPrice(
                                        pkg.priceCents / 100,
                                      )}
                                      onClose={() => setPackageDetailsOpen(false)}
                                      onAdd={(count) => {
                                        const next = Math.min(
                                          99,
                                          Math.max(1, qty + count),
                                        );
                                        setQty(next);
                                        persist(addonQty, next);
                                        setPackageDetailsOpen(false);
                                      }}
                                    />
                                  </article>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div id="addons" className="addonsCatalog groupStackAll">
                          {byCategory.map((group) => (
                            <div key={group.category} className="groupBlock">
                              <h3 className="groupCarouselTitle">{group.label}</h3>
                              <GroupCarousel
                                itemCount={group.items.length}
                                mobileGroupLayout="all"
                                ariaLabel={group.label}
                              >
                                {group.items.map((addon) => (
                                  <AddonEntityCard
                                    key={addon.id}
                                    entity={{
                                      id: addon.id,
                                      name: addon.name,
                                      priceCents: addon.priceCents,
                                      description: addon.description,
                                      image: addon.image,
                                      includedItems: [addon.description],
                                      cardPreviewBullets: [
                                        `Priced per ${addon.per}`,
                                      ],
                                    }}
                                    quantity={addonQty[addon.id] ?? 0}
                                    onQuantityChange={(next) =>
                                      setAddonQuantity(addon.id, next)
                                    }
                                  />
                                ))}
                              </GroupCarousel>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!isMobile ? (
                <div className="planTicketsCart">{desktopCart}</div>
              ) : null}
            </div>
          </div>
        </section>

        {isMobile ? mobileCart : null}
      </div>
    </div>
  );
}
