import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PackageDetails } from '../lib/packages';
import './TicketDetailsSheet.css';

type TicketDetailsSheetProps = {
  open: boolean;
  title: string;
  items: string[];
  /** CMP package details — rendered instead of flat checklist when set. */
  packageDetails?: PackageDetails;
  priceLabel: string;
  soldOut?: boolean;
  onClose: () => void;
  onAdd: (quantity: number) => void;
};

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.7 13.3 4.4 10l-1.1 1.1 4.4 4.4 9.4-9.4L15.9 5z"
      />
    </svg>
  );
}

export function TicketDetailsSheet({
  open,
  title,
  items,
  packageDetails,
  priceLabel,
  soldOut = false,
  onClose,
  onAdd,
}: TicketDetailsSheetProps) {
  const titleId = useId();
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    setQuantity(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="ticketSheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="ticketSheet__backdrop" aria-label="Close details" onClick={onClose} />
      <div className="ticketSheet__panel">
        <header className="ticketSheet__header">
          <h2 className="ticketSheet__title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="ticketSheet__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        {packageDetails ? (
          <div className="ticketSheet__packageDetails">
            <h3 className="ticketSheet__sectionTitle">Package details</h3>
            <ul className="ticketSheet__list ticketSheet__list--compact">
              {packageDetails.highlights.map((item) => (
                <li key={item}>
                  <span className="ticketSheet__check">
                    <CheckIcon />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h3 className="ticketSheet__sectionTitle">Overview</h3>
            <p className="ticketSheet__sectionBody">{packageDetails.overview}</p>
            <h3 className="ticketSheet__sectionTitle">The finer details</h3>
            <ul className="ticketSheet__list ticketSheet__list--compact">
              {packageDetails.finerDetails.map((item) => (
                <li key={item}>
                  <span className="ticketSheet__check">
                    <CheckIcon />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="ticketSheet__disclaimer">{packageDetails.disclaimer}</p>
          </div>
        ) : (
          <ul className="ticketSheet__list">
            {items.map((item) => (
              <li key={item}>
                <span className="ticketSheet__check">
                  <CheckIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="ticketSheet__footer">
          {soldOut ? (
            <div className="ticketSheet__priceRow">
              <span className="ticketSheet__price">{priceLabel}</span>
              <span className="ticketSheet__soldOut">Sold out</span>
            </div>
          ) : (
            <div className="ticketSheet__priceRow">
              <span className="ticketSheet__price">{priceLabel}</span>
              <div className="ticketSheet__qty" aria-label="Quantity">
                <button
                  type="button"
                  className="ticketSheet__qtyBtn ticketSheet__qtyBtn--minus"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 0}
                  onClick={() => setQuantity((value) => Math.max(0, value - 1))}
                >
                  −
                </button>
                <span className="ticketSheet__qtyValue">{quantity}</span>
                <button
                  type="button"
                  className="ticketSheet__qtyBtn ticketSheet__qtyBtn--plus"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                >
                  +
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            className="ticketSheet__done"
            onClick={() => onAdd(Math.max(1, quantity))}
          >
            Add
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
