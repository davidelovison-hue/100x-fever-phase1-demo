import { useId, useState } from 'react'
import {
  CHECKOUT_DONATION,
  type DonationSelection,
} from '../lib/checkoutDonation'
import './CheckoutDonation.css'

type Props = {
  selection: DonationSelection
  onChange: (next: DonationSelection) => void
}

export function CheckoutDonation({ selection, onChange }: Props) {
  const customId = useId()
  const [customDraft, setCustomDraft] = useState(
    selection.kind === 'custom' && selection.amount != null
      ? String(selection.amount)
      : '',
  )

  const selectPreset = (amount: number) => {
    if (selection.kind === 'preset' && selection.amount === amount) {
      onChange({ kind: 'none' })
      return
    }
    onChange({ kind: 'preset', amount })
  }

  const selectCustom = () => {
    const parsed = Number(customDraft.replace(/[^0-9.]/g, ''))
    onChange({
      kind: 'custom',
      amount: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    })
  }

  return (
    <div className="checkoutDonation" aria-label="Donation">
      <div className="checkoutDonation__head">
        <img
          className="checkoutDonation__logo"
          src={CHECKOUT_DONATION.logo}
          alt={CHECKOUT_DONATION.logoAlt}
          width={48}
          height={48}
          decoding="async"
        />
        <h3 className="checkoutDonation__title">{CHECKOUT_DONATION.title}</h3>
      </div>

      <p className="checkoutDonation__body">{CHECKOUT_DONATION.body}</p>

      <div className="checkoutDonation__amounts" role="group" aria-label="Donation amount">
        {CHECKOUT_DONATION.presets.map((preset) => {
          const selected =
            selection.kind === 'preset' && selection.amount === preset.amount
          return (
            <button
              key={preset.amount}
              type="button"
              className={
                selected
                  ? 'checkoutDonation__chip checkoutDonation__chip--selected'
                  : 'checkoutDonation__chip'
              }
              aria-pressed={selected}
              onClick={() => selectPreset(preset.amount)}
            >
              {preset.label}
            </button>
          )
        })}
        <button
          type="button"
          className={
            selection.kind === 'custom'
              ? 'checkoutDonation__chip checkoutDonation__chip--selected'
              : 'checkoutDonation__chip'
          }
          aria-pressed={selection.kind === 'custom'}
          onClick={selectCustom}
        >
          Custom
        </button>
      </div>

      {selection.kind === 'custom' ? (
        <div className="checkoutDonation__custom">
          <label className="checkoutDonation__customLabel" htmlFor={customId}>
            Amount (USD)
          </label>
          <input
            id={customId}
            className="checkoutDonation__customInput"
            type="number"
            inputMode="decimal"
            min={1}
            step={1}
            placeholder="Enter amount"
            value={customDraft}
            onChange={(e) => {
              const v = e.target.value
              setCustomDraft(v)
              const parsed = Number(v)
              onChange({
                kind: 'custom',
                amount: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
              })
            }}
          />
        </div>
      ) : null}

      <p className="checkoutDonation__fee">{CHECKOUT_DONATION.feeNote}</p>
      <p className="checkoutDonation__secure">
        <span className="checkoutDonation__secureIcon" aria-hidden>
          ✓
        </span>
        {CHECKOUT_DONATION.secureNote}
      </p>
    </div>
  )
}
