import { useCallback, useEffect, useState } from 'react';
import { formatPrice } from '../lib/formatPrice';
import type { ImpactAmountChip } from '../lib/packages';
import { TicketDetailsSheet } from './TicketDetailsSheet';
import './EntityCard.css';
import './AddonEntityCard.css';

export type AddonEntity = {
  id: string;
  name: string;
  unitHint?: string;
  priceCents: number;
  description: string;
  image?: string;
  listingTag?: string;
  includedItems: string[];
  cardPreviewBullets?: string[];
  amountChips?: ImpactAmountChip[];
};

type AddonEntityCardProps = {
  entity: AddonEntity;
  /** Selected amount chip (cents) when amountChips are present. */
  selectedAmountCents?: number;
  onSelectedAmountChange?: (priceCents: number) => void;
  quantity: number;
  /** Second arg is the active amount chip (cents) when chips exist. */
  onQuantityChange: (next: number, amountCents?: number) => void;
};

/**
 * Gaerten EntityCard approach for add-ons:
 * image, copy, optional amount chips, qty stepper, See more → sheet.
 */
export function AddonEntityCard({
  entity,
  selectedAmountCents,
  onSelectedAmountChange,
  quantity,
  onQuantityChange,
}: AddonEntityCardProps) {
  const chips = entity.amountChips ?? [];
  const hasChips = chips.length > 0;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [amountCents, setAmountCents] = useState(
    () => selectedAmountCents ?? chips[0]?.priceCents ?? entity.priceCents,
  );

  useEffect(() => {
    if (selectedAmountCents != null) setAmountCents(selectedAmountCents);
  }, [selectedAmountCents]);

  const closeDetails = useCallback(() => setDetailsOpen(false), []);
  const unitPriceCents = hasChips ? amountCents : entity.priceCents;
  const priceLabel = formatPrice(unitPriceCents / 100);
  const hasImage = !!entity.image;
  const selectedChipLabel =
    chips.find((c) => c.priceCents === amountCents)?.label ?? null;

  const selectAmount = (cents: number) => {
    setAmountCents(cents);
    onSelectedAmountChange?.(cents);
  };

  return (
    <article className="card cardAdmission addonEntityCard">
      {hasImage ? (
        <div className="imageWrapper">
          <div className="imageSinglePane">
            <img className="image" src={entity.image} alt="" />
          </div>
          {entity.listingTag ? (
            <div className="imageTagsCorner">
              <span className="entityListingTag entityListingTagLimited">
                {entity.listingTag}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="content">
        <div className="lead">
          <div className="header">
            <h3 className="title addonEntityCard__title">{entity.name}</h3>
          </div>

          <div className="cardConfigSubtextSlot">
            {entity.unitHint ? (
              <p className="description">{entity.unitHint}</p>
            ) : (
              <p className="description descriptionClamp">{entity.description}</p>
            )}
          </div>

          {hasChips ? (
            <>
              <div className="cardConfigMidSpacer" aria-hidden="true" />
              <div className="cardChipsSlot">
                <div className="axis">
                  <div className="pillRow" role="group" aria-label="Donation amount">
                    {chips.map((chip) => {
                      const selected = chip.priceCents === amountCents;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          className={selected ? 'pill pillSelected' : 'pill'}
                          aria-pressed={selected}
                          onClick={(event) => {
                            selectAmount(chip.priceCents);
                            const row = event.currentTarget.closest('.pillRow');
                            if (row instanceof HTMLElement) {
                              const chipEl = event.currentTarget;
                              const rowRect = row.getBoundingClientRect();
                              const chipRect = chipEl.getBoundingClientRect();
                              const pad = 10;
                              let delta = 0;
                              if (chipRect.right > rowRect.right - pad) {
                                delta = chipRect.right - rowRect.right + pad;
                              } else if (chipRect.left < rowRect.left + pad) {
                                delta = chipRect.left - rowRect.left - pad;
                              }
                              if (Math.abs(delta) >= 1) {
                                row.scrollBy({ left: delta, behavior: 'smooth' });
                              }
                            }
                          }}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          <button
            type="button"
            className="cardSeeMore"
            onClick={() => setDetailsOpen(true)}
          >
            {selectedChipLabel
              ? `See more for ${selectedChipLabel}`
              : 'See more'}{' '}
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className="footer footerWithSeeMore">
          <div className="priceRowWithStepper">
            <div className="price">
              <span className="priceAmount">{priceLabel}</span>
            </div>
            <div className="qty" aria-label={`Quantity for ${entity.name}`}>
              <button
                type="button"
                className="qtyBtnMinus"
                aria-label="Decrease quantity"
                disabled={quantity <= 0}
                onClick={() =>
                  onQuantityChange(
                    Math.max(0, quantity - 1),
                    hasChips ? amountCents : undefined,
                  )
                }
              >
                −
              </button>
              <span className="qtyValue">{quantity}</span>
              <button
                type="button"
                className="qtyBtnPlus"
                aria-label="Increase quantity"
                onClick={() =>
                  onQuantityChange(
                    Math.min(99, quantity + 1),
                    hasChips ? amountCents : undefined,
                  )
                }
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <TicketDetailsSheet
        open={detailsOpen}
        title={
          selectedChipLabel
            ? `${entity.name} — ${selectedChipLabel}`
            : entity.name
        }
        items={entity.includedItems}
        priceLabel={priceLabel}
        onClose={closeDetails}
        onAdd={(count) => {
          onQuantityChange(
            Math.min(99, quantity + count),
            hasChips ? amountCents : undefined,
          );
          closeDetails();
        }}
      />
    </article>
  );
}
