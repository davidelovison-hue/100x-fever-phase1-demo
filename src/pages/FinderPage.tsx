import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EVENT,
  PACKAGES,
  SECTION_BLURBS,
  formatCheckIn,
  type Section,
} from '../lib/packages';
import { handoverPath } from '../lib/routes';
import { formatPrice } from '../lib/formatPrice';

export function FinderPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section | 'all'>('all');
  const [nights, setNights] = useState<'all' | '4' | '5' | '6'>('all');
  const [guests, setGuests] = useState<'all' | '2' | '4'>('all');

  const filtered = useMemo(() => {
    return PACKAGES.filter((p) => {
      if (section !== 'all' && p.section !== section) return false;
      if (nights !== 'all' && String(p.nights) !== nights) return false;
      if (guests !== 'all' && String(p.guests) !== guests) return false;
      return true;
    });
  }, [section, nights, guests]);

  return (
    <div className="finderShell">
      <div className="finderShell__inner">
        <div className="finderPanel">
          <div className="finderBrand">
            <img src={`${import.meta.env.BASE_URL}cmp-logo.png`} alt="Crash My Playa" />
            <span className="feverNav__pill">100x package finder · demo</span>
          </div>
          <h1 className="hDisplay">{EVENT.title}</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            {EVENT.subtitle}. {EVENT.dates}. Continue opens Fever with one
            preselected package, then the exact Connect → Checkout → Success
            screens.
          </p>

          <div className="banner">
            <div>
              Inventory from <strong>crashmyplaya.com</strong>. Prices are{' '}
              <strong>demo estimates</strong>.
            </div>
          </div>

          <div className="gridFilters">
            <div className="field">
              <label htmlFor="section">Section</label>
              <select
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value as Section | 'all')}
              >
                <option value="all">All sections</option>
                <option value="run-of-house">Run of House</option>
                <option value="venue">Venue</option>
                <option value="sunrise">Sunrise</option>
                <option value="nizuc">Nizuc</option>
                <option value="grand">The Grand</option>
                <option value="golf">Golf Course</option>
                <option value="belmond">Belmond Maroma</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="nights">Nights</label>
              <select
                id="nights"
                value={nights}
                onChange={(e) =>
                  setNights(e.target.value as 'all' | '4' | '5' | '6')
                }
              >
                <option value="all">Any</option>
                <option value="4">4 nights</option>
                <option value="5">5 nights</option>
                <option value="6">6 nights</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="guests">Guests</label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value as 'all' | '2' | '4')}
              >
                <option value="all">Any</option>
                <option value="2">2 guests</option>
                <option value="4">4 guests</option>
              </select>
            </div>
          </div>

          {section !== 'all' ? (
            <p className="dim" style={{ marginTop: 0 }}>
              {SECTION_BLURBS[section]}
            </p>
          ) : null}

          <p className="dim">
            Showing {filtered.length} of {PACKAGES.length} demo packages
          </p>

          <div className="pkgList">
            {filtered.length === 0 ? (
              <div className="emptyState">No packages match these filters.</div>
            ) : (
              filtered.map((p) => (
                <article key={p.id} className="pkgCard">
                  <div>
                    <h2 className="pkgCard__title">{p.name}</h2>
                    <div className="pkgCard__meta">
                      <span>{p.sectionLabel}</span>
                      <span>{p.roomType}</span>
                      <span>{p.bed}</span>
                      <span>Check-in {formatCheckIn(p.checkIn)}</span>
                      <span>
                        {p.remaining} / {p.capacity} left in pool
                      </span>
                    </div>
                  </div>
                  <div className="pkgCard__price">
                    <strong>{formatPrice(p.priceCents / 100)}</strong>
                    <span className="dim">package total</span>
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="btn btnPrimary"
                        onClick={() => navigate(handoverPath(p.id))}
                      >
                        Continue to Fever
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
