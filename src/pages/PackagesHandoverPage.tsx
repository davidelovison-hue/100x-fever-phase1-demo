import { useNavigate } from 'react-router-dom';
import { buildCheckoutStateFromPackage } from '../lib/buildCheckoutState';
import { persistCheckoutBasket } from '../lib/checkoutFlowStorage';
import { FESTIVAL_EVENT_ID } from '../lib/festivalEvent';
import {
  persistHandoffPlan,
  resetHandoffPlanSelection,
} from '../lib/handoffPlanStorage';
import {
  DEMO_FINDER_SELECTION,
  DEMO_PACKAGE_ID,
  getPackage,
} from '../lib/packages';
import { handoverLocation } from '../lib/routes';
import { publicAsset } from '../lib/publicAsset';
import './PackagesHandoverPage.css';

const TOTAL = 9699;
const PER_PERSON = 2424.75;
const PER_PERSON_NIGHT = 484.95;

/**
 * Visual clone of crashmyplaya.com/packages guided finder — step 5 Review Your Package.
 * CTA hands off to Fever instead of Tixr.
 */
export function PackagesHandoverPage() {
  const navigate = useNavigate();
  const pkg = getPackage(DEMO_PACKAGE_ID)!;
  const basket = buildCheckoutStateFromPackage(DEMO_PACKAGE_ID, [])!;

  const goToFever = () => {
    resetHandoffPlanSelection(DEMO_PACKAGE_ID);
    persistHandoffPlan({
      packageId: DEMO_PACKAGE_ID,
      qty: 1,
      addonQty: {},
    });
    persistCheckoutBasket(FESTIVAL_EVENT_ID, basket);
    navigate(handoverLocation(DEMO_PACKAGE_ID), {
      state: { ...basket, fromFinder: true },
    });
  };

  return (
    <div className="cmp">
      <div className="cmp__saleBar">
        Packages On Sale Now! | Booking Assistance: (855) 839-9107
      </div>

      <header className="cmp__nav">
        <div className="cmp__navLeft">
          <button type="button" className="cmp__iconBtn" aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
          <button type="button" className="cmp__pillGhost">
            PACKAGE INFO
          </button>
        </div>

        <div className="cmp__navCenter">
          <img src={publicAsset('cmp-logo.png')} alt="Crash My Playa" className="cmp__logo" />
          <div className="cmp__navDivider" />
          <div className="cmp__dates">
            <strong>January 13-16, 2027</strong>
            <span>Riviera Cancún, MX</span>
          </div>
        </div>

        <button type="button" className="cmp__pillYellow" onClick={goToFever}>
          BOOK YOUR TRIP
        </button>
      </header>

      <div className="cmp__finderChrome">
        <div className="cmp__finderTop">
          <button type="button" className="cmp__textLink">
            ← Back
          </button>
          <h1 className="cmp__reviewTitle">Review Your Package</h1>
          <button type="button" className="cmp__textLink">
            Start Over
          </button>
        </div>

        <div className="cmp__steps" aria-label="Package finder steps">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`cmp__step${n < 5 ? ' is-done' : ''}${n === 5 ? ' is-current' : ''}`}
            >
              <span className="cmp__stepDot">{n < 5 ? '✓' : n}</span>
              {n < 5 ? <span className="cmp__stepLine" /> : null}
            </div>
          ))}
        </div>

        <div className="cmp__summaryPills">
          <button type="button" className="cmp__summaryPill">
            {DEMO_FINDER_SELECTION.numberOfNights} Nights <span>✎</span>
          </button>
          <button type="button" className="cmp__summaryPill">
            Jan 13 <span>✎</span>
          </button>
          <button type="button" className="cmp__summaryPill">
            {DEMO_FINDER_SELECTION.numberOfGuests} Guests <span>✎</span>
          </button>
          <button type="button" className="cmp__summaryPill">
            Run of House ${Math.round(PER_PERSON_NIGHT)} pp/night <span>✎</span>
          </button>
          <button type="button" className="cmp__summaryPill">
            Double <span>✎</span>
          </button>
        </div>
      </div>

      <main className="cmp__main">
        <article className="cmp__packageCard">
          <div className="cmp__packageCardTop">
            <div>
              <span className="cmp__tag">YOUR PACKAGE</span>
              <h2 className="cmp__packageName">RUN OF HOUSE</h2>
            </div>
            <div className="cmp__packageActions">
              <button type="button" className="cmp__squareBtn" aria-label="Favorite">
                ★
              </button>
              <button type="button" className="cmp__squareBtn" aria-label="Share">
                ↗
              </button>
            </div>
          </div>

          <div className="cmp__metaGrid">
            <div>
              <span>Nights</span>
              <strong>5</strong>
            </div>
            <div>
              <span>Guests</span>
              <strong>4</strong>
            </div>
            <div>
              <span>Check-in</span>
              <strong>Wed, Jan 13, 2027</strong>
            </div>
            <div>
              <span>Check-out</span>
              <strong>Mon, Jan 18, 2027</strong>
            </div>
            <div>
              <span>Room Type</span>
              <strong>Double</strong>
            </div>
            <div>
              <span>Bed Config</span>
              <strong>2 Double Beds</strong>
            </div>
          </div>

          <div className="cmp__priceBlock">
            <div>
              <div className="cmp__pp">
                ${PER_PERSON.toLocaleString('en-US', { minimumFractionDigits: 2 })} per person
              </div>
              <div className="cmp__ppn">
                ${PER_PERSON_NIGHT.toLocaleString('en-US', { minimumFractionDigits: 2 })} per person
                / night
              </div>
            </div>
            <div className="cmp__total">
              <span>Total</span>
              <strong>${TOTAL.toLocaleString('en-US')}</strong>
            </div>
          </div>
        </article>

        <div className="cmp__buyRow">
          <div className="cmp__buyActions">
            <button type="button" className="cmp__backBtn">
              ← Back
            </button>
            <button type="button" className="cmp__buyBtn" onClick={goToFever}>
              Buy Now →
            </button>
          </div>
          <p className="cmp__buyNote">
            You&apos;ll be redirected to Fever to complete your purchase securely.
          </p>
        </div>

        <div className="cmp__gallery">
          <img src={publicAsset('room-1.webp')} alt="Run of House room" />
          <img src={publicAsset('room-2.avif')} alt="Run of House accommodation" />
        </div>

        <section className="cmp__detailsCard">
          <span className="cmp__tag">PACKAGE DETAILS</span>
          <ul>
            <li>Five (5) Nights at Run of House</li>
            <li>Admission for 4 guests each show night</li>
            <li>Access to pool parties &amp; late-night sets</li>
            <li>Airport transportation to and from the resort</li>
            <li>Official Crash My Playa Welcome Gifts</li>
            <li>All-inclusive food &amp; drinks at Moon Palace Cancún</li>
          </ul>

          <span className="cmp__tag">OVERVIEW</span>
          <p>
            Our Run of House rooms offer event access at our most affordable
            price, equipped with all the amenities and comforts you need to
            enjoy your stay. A Run of House room can be any room type within the
            Venue, Sunrise, Nizuc, The Grand, or Golf Course sections of the
            resort.
          </p>

          <span className="cmp__tag">THE FINER DETAILS</span>
          <ul>
            <li>
              These rooms will be randomly assigned based on availability, so
              specific room requests cannot be accommodated.
            </li>
            <li>
              Guests with a Run of House package will be surprised with their
              specific room assignment at event check-in.
            </li>
            <li>Package configuration cannot be changed after purchase.</li>
          </ul>
        </section>

        <p className="cmp__footnote">
          {pkg.packageId100x} · from crashmyplaya.com/packages guided step 5
        </p>
      </main>

      <button type="button" className="cmp__chat" aria-label="Chat with 100x">
        <span>CHAT WITH</span>
        <strong>100X</strong>
        <em>PRESENTS</em>
      </button>
    </div>
  );
}
