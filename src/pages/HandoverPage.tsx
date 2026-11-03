import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { buildCheckoutStateFromPackage } from '../lib/buildCheckoutState';
import { persistCheckoutBasket } from '../lib/checkoutFlowStorage';
import { formatPrice } from '../lib/formatPrice';
import { FESTIVAL_EVENT_ID } from '../lib/festivalEvent';
import {
  ADDONS,
  DEMO_PACKAGE_ID,
  EVENT,
  formatCheckIn,
  getPackage,
} from '../lib/packages';
import { connectPath, planPath } from '../lib/routes';

/**
 * Fever side after 100x finder handoff: only the preselected package + add-ons.
 */
export function HandoverPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const paramId = params.get('package_id') ?? DEMO_PACKAGE_ID;
  const pkg = getPackage(paramId);
  const [addonIds, setAddonIds] = useState<string[]>([]);

  useEffect(() => {
    setAddonIds([]);
  }, [paramId]);

  const checkoutPreview = useMemo(
    () => (paramId ? buildCheckoutStateFromPackage(paramId, addonIds) : null),
    [paramId, addonIds],
  );

  if (!pkg || !checkoutPreview) {
    return <Navigate to={planPath()} replace />;
  }

  const toggleAddon = (id: string) => {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const continueToConnect = () => {
    persistCheckoutBasket(FESTIVAL_EVENT_ID, checkoutPreview);
    navigate(connectPath(FESTIVAL_EVENT_ID), { state: checkoutPreview });
  };

  return (
    <div className="page">
      <div className="banner">
        <div>
          <strong>Fever · package step.</strong> Handed off from 100x with{' '}
          <code>pkg={pkg.packageId100x}</code>. Only this package is shown — then
          Connect (exact Fever screen).
        </div>
      </div>

      <div className="handoverLayout">
        <div className="heroCard">
          <img src={EVENT.image} alt="" />
          <div className="heroCard__body">
            <p className="dim" style={{ margin: 0 }}>
              {EVENT.title}
            </p>
            <h1 className="hDisplay" style={{ marginTop: 4 }}>
              {pkg.name}
            </h1>
            <div className="chipRow">
              <span className="chip">{pkg.sectionLabel}</span>
              <span className="chip">{pkg.roomType}</span>
              <span className="chip">{pkg.nights} nights</span>
              <span className="chip">{pkg.guests} guests</span>
              <span className="chip">Check-in {formatCheckIn(pkg.checkIn)}</span>
            </div>
            <ul className="includeList">
              {pkg.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="sideCard">
          <h2 className="hSection">Add-ons</h2>
          <p className="dim" style={{ marginTop: 0 }}>
            Selected on Fever after the 100x handoff.
          </p>
          {ADDONS.map((addon) => (
            <label key={addon.id} className="addonRow">
              <input
                type="checkbox"
                checked={addonIds.includes(addon.id)}
                onChange={() => toggleAddon(addon.id)}
              />
              <div className="addonRow__text">
                <strong>{addon.name}</strong>
                <span>{addon.description}</span>
              </div>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {formatPrice(addon.priceCents / 100)}
              </div>
            </label>
          ))}

          <div
            style={{
              marginTop: 16,
              borderTop: '1px solid var(--border)',
              paddingTop: 12,
            }}
          >
            <div className="summaryLine">
              <strong>Total</strong>
              <strong>{formatPrice(checkoutPreview.total)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn btnCta btnBlock"
            style={{ marginTop: 16 }}
            onClick={continueToConnect}
          >
            Continue
          </button>
          <Link to={planPath()} className="btn btnGhost btnBlock" style={{ marginTop: 10 }}>
            ← Back to 100x packages
          </Link>
        </aside>
      </div>
    </div>
  );
}
