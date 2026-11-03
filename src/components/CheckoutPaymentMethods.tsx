import { useEffect, useId, useState, type MouseEvent, type ReactNode } from 'react'
import { PaymentMethodBadge } from './PaymentMethodBadge'
import { InstallmentsPicker } from './InstallmentsPicker'
import { formatCardNumber, formatExpiry } from '../lib/cardInputFormat'
import { formatPrice } from '../lib/formatPrice'
import '../CheckoutPage.css'
import './CheckoutPaymentMethods.css'

const TERMS_URL = 'https://feverup.com/legal/terms'
const PRIVACY_URL = 'https://feverup.com/legal/privacy'
const TERMS_OF_USE_URL = 'https://feverup.com/legal/terms'

type PaymentMethodId =
  | 'card_visa_9694'
  | 'card_mc_4267'
  | 'card_mc_3804'
  | 'new_card'
  | 'paypal'
  | 'google_pay'
  | 'klarna'

type ModalView = 'methods' | 'new_card'

type CardBrand = 'visa' | 'mastercard'

type PaymentOption = {
  id: PaymentMethodId
  label: string
  sublabel?: string
  kind: 'card' | 'new_card' | 'paypal' | 'google_pay' | 'klarna'
  brand?: CardBrand
  supportsInstallments: boolean
}

type NewCardForm = {
  cardNumber: string
  expiry: string
  cvc: string
  zip: string
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'card_visa_9694',
    label: 'Ending in 9694',
    kind: 'card',
    brand: 'visa',
    supportsInstallments: true,
  },
  {
    id: 'card_mc_4267',
    label: 'Ending in 4267',
    kind: 'card',
    brand: 'mastercard',
    supportsInstallments: true,
  },
  {
    id: 'card_mc_3804',
    label: 'Ending in 3804',
    kind: 'card',
    brand: 'mastercard',
    supportsInstallments: true,
  },
  {
    id: 'new_card',
    label: 'New Card',
    kind: 'new_card',
    supportsInstallments: true,
  },
  {
    id: 'paypal',
    label: 'New Paypal account',
    sublabel:
      'Pay in full or split into 4 interest-free payments in PayPal, subject to eligibility.',
    kind: 'paypal',
    supportsInstallments: false,
  },
  {
    id: 'google_pay',
    label: 'Google Pay',
    kind: 'google_pay',
    supportsInstallments: false,
  },
  {
    id: 'klarna',
    label: 'Klarna',
    kind: 'klarna',
    supportsInstallments: false,
  },
]

const EMPTY_NEW_CARD: NewCardForm = {
  cardNumber: '',
  expiry: '',
  cvc: '',
  zip: '',
}

function detectBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.startsWith('4')) return 'visa'
  return 'mastercard'
}

export type CheckoutPaymentMethodsProps = {
  total: number
  /** Used for installment initial payment (fees). */
  serviceFee?: number
  onPay: () => void
  /** Use when embedded in a parent <form> (guest checkout). */
  submitType?: 'submit' | 'button'
  /** Hidden on guest checkout (terms collected in contact section). */
  showTermsAccept?: boolean
}

export function CheckoutPaymentMethods({
  total,
  serviceFee = 0,
  onPay,
  submitType = 'button',
  showTermsAccept = true,
}: CheckoutPaymentMethodsProps) {
  const paymentHeadingId = useId()
  const modalTitleId = useId()
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('card_mc_3804')
  const [modalView, setModalView] = useState<ModalView | null>(null)
  const [newCard, setNewCard] = useState<NewCardForm>(EMPTY_NEW_CARD)
  const [savedNewCard, setSavedNewCard] = useState<{ last4: string; brand: CardBrand } | null>(
    null,
  )

  const baseSelected = PAYMENT_OPTIONS.find((o) => o.id === paymentMethod) ?? PAYMENT_OPTIONS[2]
  const selected: PaymentOption =
    paymentMethod === 'new_card' && savedNewCard
      ? {
          ...baseSelected,
          label: `Ending in ${savedNewCard.last4}`,
          brand: savedNewCard.brand,
          kind: 'card',
        }
      : baseSelected

  const canPay = showTermsAccept ? termsAccepted : true
  const modalOpen = modalView !== null

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (modalView === 'new_card') {
        setModalView('methods')
        return
      }
      setModalView(null)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen, modalView])

  const handlePayClick = () => {
    if (!canPay) return
    if (submitType === 'button') onPay()
  }

  const handlePayButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!canPay) {
      e.preventDefault()
    }
  }

  const stopLabelBubble = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
  }

  const closeModal = () => setModalView(null)

  const pickMethod = (id: PaymentMethodId) => {
    if (id === 'new_card') {
      setNewCard(EMPTY_NEW_CARD)
      setModalView('new_card')
      return
    }
    setPaymentMethod(id)
    setModalView(null)
  }

  const continueNewCard = () => {
    const digits = newCard.cardNumber.replace(/\D/g, '')
    const last4 = digits.slice(-4) || '4242'
    const brand = detectBrand(newCard.cardNumber)
    setSavedNewCard({ last4, brand })
    setPaymentMethod('new_card')
    setModalView(null)
  }

  const updateNewCard = <K extends keyof NewCardForm>(key: K, value: NewCardForm[K]) => {
    setNewCard((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <h2 id={paymentHeadingId} className="guestCheckoutSectionTitle">
        <span className="guestCheckoutSectionTitle__icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        Payment method
      </h2>

      <div className="checkoutSavedPay">
        <button
          type="button"
          className="checkoutSavedPay__trigger"
          aria-expanded={modalOpen}
          aria-haspopup="dialog"
          onClick={() => setModalView('methods')}
        >
          <span className="checkoutSavedPay__main">
            <span className="checkoutSavedPay__logo" aria-hidden>
              <PaymentOptionIcon option={selected} />
            </span>
            <span className="checkoutSavedPay__label">{selected.label}</span>
          </span>
          <span className="checkoutSavedPay__chevron" aria-hidden>
            <ChevronDown />
          </span>
        </button>

        {selected.supportsInstallments ? (
          <InstallmentsPicker total={total} serviceFee={serviceFee} />
        ) : null}
      </div>

      {modalView === 'methods' ? (
        <div className="payMethodModal" role="presentation">
          <button
            type="button"
            className="payMethodModal__backdrop"
            aria-label="Close payment methods"
            onClick={closeModal}
          />
          <div
            className="payMethodModal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
          >
            <div className="payMethodModal__header">
              <h2 id={modalTitleId} className="payMethodModal__title">
                Select payment method
              </h2>
              <button
                type="button"
                className="payMethodModal__close"
                aria-label="Close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="payMethodModal__list" role="radiogroup" aria-labelledby={modalTitleId}>
              {PAYMENT_OPTIONS.map((option) => {
                const checked = paymentMethod === option.id
                return (
                  <label
                    key={option.id}
                    className={`payMethodModal__option${checked ? ' payMethodModal__option--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="checkout-payment-method"
                      value={option.id}
                      checked={checked}
                      onChange={() => pickMethod(option.id)}
                    />
                    <span className="payMethodModal__optionIcon" aria-hidden>
                      <PaymentOptionIcon option={option} />
                    </span>
                    <span className="payMethodModal__optionText">
                      <span className="payMethodModal__optionLabel">{option.label}</span>
                      {option.sublabel ? (
                        <span className="payMethodModal__optionSub">{option.sublabel}</span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>

            <p className="payMethodModal__secure">
              <LockIcon />
              Your payment info is stored securely
            </p>
          </div>
        </div>
      ) : null}

      {modalView === 'new_card' ? (
        <div className="payMethodModal" role="presentation">
          <button
            type="button"
            className="payMethodModal__backdrop"
            aria-label="Close add card"
            onClick={closeModal}
          />
          <div
            className="payMethodModal__card payMethodModal__card--newCard"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
          >
            <div className="payMethodModal__header">
              <button
                type="button"
                className="payMethodModal__back"
                aria-label="Back"
                onClick={() => setModalView('methods')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h2 id={modalTitleId} className="payMethodModal__title">
                Add new card
              </h2>
              <button
                type="button"
                className="payMethodModal__close"
                aria-label="Close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="addCardForm">
              <div className="addCardForm__field addCardForm__field--icon">
                <span className="addCardForm__icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  className="addCardForm__input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="Card number"
                  aria-label="Card number"
                  value={newCard.cardNumber}
                  onChange={(e) => updateNewCard('cardNumber', formatCardNumber(e.target.value))}
                />
              </div>

              <div className="addCardForm__row">
                <input
                  className="addCardForm__input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="Expiry date"
                  aria-label="Expiry date"
                  value={newCard.expiry}
                  onChange={(e) => updateNewCard('expiry', formatExpiry(e.target.value))}
                />
                <input
                  className="addCardForm__input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="CVC"
                  aria-label="CVC"
                  maxLength={4}
                  value={newCard.cvc}
                  onChange={(e) =>
                    updateNewCard('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                />
              </div>

              <input
                className="addCardForm__input"
                type="text"
                autoComplete="postal-code"
                placeholder="ZIP Code"
                aria-label="ZIP Code"
                value={newCard.zip}
                onChange={(e) => updateNewCard('zip', e.target.value)}
              />

              <div className="addCardForm__accepted">
                <p className="addCardForm__acceptedLabel">Accepted Cards</p>
                <div className="addCardForm__brands" aria-hidden>
                  <CardBrandVisa />
                  <CardBrandMastercard />
                  <CardBrandAmex />
                  <CardBrandDiscover />
                  <CardBrandJcb />
                  <CardBrandDiners />
                </div>
              </div>

              <p className="addCardForm__secure">
                <LockIcon />
                Your payment info is stored securely
              </p>

              <button type="button" className="addCardForm__continue" onClick={continueNewCard}>
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="guestCheckoutSecure">
        <LockIcon />
        Your payment details are stored securely
      </p>

      {showTermsAccept && (
        <>
          <label className="checkoutLegalAccept">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span className="checkoutLegalAccept__text">
              By continuing you accept the{' '}
              <a
                href={TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopLabelBubble}
              >
                Terms and Conditions
              </a>{' '}
              and the{' '}
              <a
                href={PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stopLabelBubble}
              >
                Privacy Policy
              </a>
            </span>
          </label>

          <hr className="checkoutLegalDivider" aria-hidden />
        </>
      )}

      <nav
        className={`checkoutLegalLinks${showTermsAccept ? '' : ' checkoutLegalLinks--afterSecure'}`}
        aria-label="Legal documents"
      >
        <a
          className="checkoutLegalLinks__item"
          href={TERMS_OF_USE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms and conditions of use
          <ExternalLinkIcon />
        </a>
        <a
          className="checkoutLegalLinks__item"
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy policy
          <ExternalLinkIcon />
        </a>
      </nav>

      <hr className="guestCheckoutPayDivider" />

      <div className="checkoutPaySticky">
        <button
          type={submitType}
          className="checkoutPayBtn guestCheckoutPayBtn"
          disabled={!canPay}
          onClick={submitType === 'button' ? handlePayClick : handlePayButtonClick}
        >
          Pay {formatPrice(total)}
        </button>
      </div>
    </>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PaymentOptionIcon({ option }: { option: PaymentOption }): ReactNode {
  if (option.brand === 'visa') return <CardBrandVisa />
  if (option.brand === 'mastercard') return <CardBrandMastercard />
  if (option.kind === 'new_card') return <NewCardIcon />
  if (option.kind === 'paypal') return <PaymentMethodBadge kind="paypal" />
  if (option.kind === 'google_pay') return <PaymentMethodBadge kind="google_pay" />
  return <PaymentMethodBadge kind="klarna" />
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      className="checkoutLegalLinks__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M14 5h5v5M10 14L19 5M19 5h-4M19 5v4M5 9v10h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NewCardIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden>
      <rect x="1" y="2" width="30" height="16" rx="2.5" fill="#fff" stroke="#c5ced4" />
      <path d="M1 7h30" stroke="#c5ced4" strokeWidth="1.25" />
    </svg>
  )
}

function CardBrandVisa() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#1a1f71" />
      <text x="16" y="13" fill="#fff" fontSize="7" fontWeight="700" textAnchor="middle">
        VISA
      </text>
    </svg>
  )
}

function CardBrandMastercard() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#f5f5f5" />
      <circle cx="13" cy="10" r="6" fill="#eb001b" />
      <circle cx="19" cy="10" r="6" fill="#f79e1b" />
    </svg>
  )
}

function CardBrandAmex() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#2e77bc" />
      <text x="16" y="13" fill="#fff" fontSize="5.5" fontWeight="700" textAnchor="middle">
        AMEX
      </text>
    </svg>
  )
}

function CardBrandDiscover() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#ff6000" />
      <text x="16" y="13" fill="#fff" fontSize="5" fontWeight="700" textAnchor="middle">
        DISC
      </text>
    </svg>
  )
}

function CardBrandJcb() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#0e4c96" />
      <text x="16" y="13" fill="#fff" fontSize="7" fontWeight="700" textAnchor="middle">
        JCB
      </text>
    </svg>
  )
}

function CardBrandDiners() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#0079be" />
      <circle cx="16" cy="10" r="5.5" fill="none" stroke="#fff" strokeWidth="1.5" />
    </svg>
  )
}
