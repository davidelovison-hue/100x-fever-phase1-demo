import { useEffect, useId, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useCart } from '../lib/cartContext'
import { formatPrice } from '../lib/formatPrice'
import { isOrderConfirmationState, type OrderConfirmationState } from '../lib/checkoutState'
import { readPersistedOrderConfirmation } from '../lib/orderConfirmStorage'
import { planPath } from '../lib/routes'
import '../CheckoutPage.css'
import '../OrderConfirmationPage.css'

export function OrderConfirmationPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const location = useLocation()
  const { clearCart } = useCart()
  const summaryId = useId()
  const instructionsId = useId()
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false)
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const locationState = location.state as unknown
  const fromNavigation: OrderConfirmationState | null =
    eventId &&
    locationState != null &&
    typeof locationState === 'object' &&
    isOrderConfirmationState(locationState) &&
    locationState.eventId === eventId
      ? locationState
      : null
  const fromStorage = eventId ? readPersistedOrderConfirmation(eventId) : null
  const data: OrderConfirmationState | null = fromNavigation ?? fromStorage

  useEffect(() => {
    if (!data) return
    clearCart()
  }, [data, clearCart])

  if (!eventId || !data) {
    return <Navigate to={eventId ? planPath('entry') : '/'} replace />
  }

  const ticketLine = data.lines.find((l) => l.id === 'ticket') ?? data.lines[0]
  const ticketId = `TKT-${data.orderRef.replace(/[^a-zA-Z0-9]/g, '').slice(-10).toUpperCase()}`

  return (
    <div className="orderConfirmPage">
      <div className="orderConfirmPage__shell orderConfirmPage__shell--narrow">
        <div className="orderConfirmStack">
          <div className="orderConfirmSuccess" role="status">
            <span className="orderConfirmSuccess__icon" aria-hidden>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="rgba(36, 168, 101, 0.35)" />
                <circle cx="20" cy="20" r="19" stroke="rgba(61, 214, 140, 0.45)" strokeWidth="1" />
                <path
                  d="M12 20.5l5 5L28 14.5"
                  stroke="#5ee09a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="orderConfirmSuccess__title">Success!</h1>
            <p className="orderConfirmSuccess__lead">Your booking is confirmed.</p>
          </div>

          <article className="orderConfirmCard">
            <div className="orderConfirmEventRow">
              <img
                src={data.eventImage}
                alt=""
                className="orderConfirmEventRow__img"
                width={64}
                height={64}
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="orderConfirmEventRow__text">
                <h2 className="orderConfirmEventRow__title">{data.eventTitle}</h2>
                <p className="orderConfirmEventRow__id">
                  <span className="orderConfirmEventRow__idLabel">Order ID</span> {data.orderRef}
                </p>
              </div>
            </div>

            <p className="orderConfirmVenue">
              <span className="orderConfirmVenue__icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="11" r="2" fill="currentColor" />
                </svg>
              </span>
              {data.venue}
            </p>

            <div className="orderConfirmAccordion">
              <button
                type="button"
                className="orderConfirmAccordion__trigger"
                aria-expanded={orderSummaryOpen}
                aria-controls={summaryId}
                id={`${summaryId}-label`}
                onClick={() => setOrderSummaryOpen((o) => !o)}
              >
                <span>Order summary</span>
                <span className={`orderConfirmAccordion__chev ${orderSummaryOpen ? 'orderConfirmAccordion__chev--open' : ''}`} aria-hidden>
                  ▾
                </span>
              </button>
              <div
                id={summaryId}
                role="region"
                aria-labelledby={`${summaryId}-label`}
                aria-hidden={!orderSummaryOpen}
                className={`orderConfirmAccordion__panel ${orderSummaryOpen ? 'orderConfirmAccordion__panel--open' : ''}`}
              >
                <ul className="orderConfirmLines">
                  {data.lines.map((line) => (
                    <li key={line.id} className="orderConfirmLine">
                      <span>{line.label}</span>
                      <span className="orderConfirmLine__price">{formatPrice(line.amount)}</span>
                    </li>
                  ))}
                  {data.serviceFee > 0 ? (
                    <li className="orderConfirmLine orderConfirmLine--muted">
                      <span>Booking fee</span>
                      <span className="orderConfirmLine__price">{formatPrice(data.serviceFee)}</span>
                    </li>
                  ) : null}
                </ul>
                <p className="orderConfirmTotal">
                  Total: <strong>{formatPrice(data.total)}</strong>
                </p>
              </div>
            </div>
          </article>

          <article className="orderConfirmCard">
            <h2 className="orderConfirmMyTickets__heading">My tickets</h2>
            <div className="orderConfirmTicketBlock">
              <p className="orderConfirmTicketBlock__line">{ticketLine?.label ?? 'General admission'}</p>
              <p className="orderConfirmTicketBlock__when">{data.dateLine}</p>
              <p className="orderConfirmTicketBlock__tid">
                <span className="orderConfirmTicketBlock__tidLabel">Ticket ID</span> {ticketId}
              </p>
            </div>

            <div className="orderConfirmInstructions">
              <button
                type="button"
                className="orderConfirmInstructions__toggle"
                aria-expanded={instructionsOpen}
                aria-controls={instructionsId}
                id={`${instructionsId}-label`}
                onClick={() => setInstructionsOpen((o) => !o)}
              >
                <span>Instructions</span>
                <span className="orderConfirmInstructions__more">{instructionsOpen ? 'Read less' : 'Read more'}</span>
              </button>
              <div
                id={instructionsId}
                role="region"
                aria-labelledby={`${instructionsId}-label`}
                aria-hidden={!instructionsOpen}
                className={`orderConfirmInstructions__body ${instructionsOpen ? 'orderConfirmInstructions__body--open' : ''}`}
              >
                <p>
                  The promoter 100x will reach out with all info shortly via email.
                </p>
              </div>
            </div>
          </article>

          <footer className="orderConfirmFooter">
            <p className="orderConfirmFooter__email">
              We&apos;ve sent a purchase confirmation to your inbox. 100x will follow up with guest
              details and arrival info by email.
            </p>
            <p className="orderConfirmFooter__legal">
              Ticket and purchase terms are available on{' '}
              <a href="https://feverup.com/legal/terms" target="_blank" rel="noopener noreferrer">
                feverup.com
              </a>
              .
            </p>
            <p className="orderConfirmFooter__help">
              Need help?{' '}
              <a href="https://feverup.com/contact" target="_blank" rel="noopener noreferrer">
                Contact customer support
              </a>
              .
            </p>
          </footer>

          <div className="orderConfirmCtaWrap">
            <Link className="orderConfirmCta" to={planPath('entry')}>
              View more events
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
