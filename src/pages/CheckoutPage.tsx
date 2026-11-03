import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckoutDonation } from '../components/CheckoutDonation'
import { CheckoutPaymentMethods } from '../components/CheckoutPaymentMethods'
import { CheckoutSummaryCard } from '../components/CheckoutSummaryCard'
import {
  checkoutHasGuestIdentity,
  checkoutHasPmrProof,
  checkoutRequiresPmrProof,
  checkoutStateWithoutGuest,
  placeholderGuestForPostBooking,
  type EventCheckoutState,
  type OrderConfirmationState,
} from '../lib/checkoutState'
import {
  clearCheckoutFormDrafts,
  persistCheckoutBasket,
  resolveEventCheckoutState,
} from '../lib/checkoutFlowStorage'
import type { DonationSelection } from '../lib/checkoutDonation'
import { withCheckoutDonation } from '../lib/withCheckoutDonation'
import { persistOrderConfirmation } from '../lib/orderConfirmStorage'
import { connectPath, planPath, orderConfirmationPath, pmrPreBookingPath } from '../lib/routes'
import { persistLastOrderEventId, upsertUserSession } from '../lib/userSession'
import '../CheckoutPage.css'
import '../GuestCheckoutPage.css'

export function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [donation, setDonation] = useState<DonationSelection>({ kind: 'none' })

  const state = location.state as unknown
  const data = useMemo(
    () => (eventId ? resolveEventCheckoutState(eventId, state) : null),
    [eventId, state],
  )

  if (!eventId || !data) {
    return <Navigate to={eventId ? planPath('entry') : '/'} replace />
  }

  if (checkoutRequiresPmrProof(data) && !checkoutHasPmrProof(data)) {
    return <Navigate to={pmrPreBookingPath(eventId)} replace state={data} />
  }

  const stripped = checkoutStateWithoutGuest(data)
  let checkoutBase: EventCheckoutState = data

  if (!checkoutHasGuestIdentity(data)) {
    if (!data.email?.trim()) {
      return <Navigate to={connectPath(eventId)} replace state={stripped} />
    }
    checkoutBase = {
      ...data,
      guest: placeholderGuestForPostBooking(
        data.email,
        data.guest?.fullName || undefined,
      ),
    }
  }

  if (!checkoutHasGuestIdentity(checkoutBase)) {
    return <Navigate to={connectPath(eventId)} replace state={stripped} />
  }

  const checkoutData = withCheckoutDonation(checkoutBase, donation)

  const summaryPayload = {
    eventTitle: checkoutData.eventTitle,
    eventImage: checkoutData.eventImage,
    venue: checkoutData.venue,
    dateLine: checkoutData.dateLine,
    lines: checkoutData.lines,
    subtotal: checkoutData.subtotal,
    serviceFee: checkoutData.serviceFee,
    total: checkoutData.total,
  }

  const onPay = () => {
    const guest = checkoutData.guest
    if (!guest) return
    const orderRef = `ARDE-${eventId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const payload: OrderConfirmationState = { ...checkoutData, guest, orderRef }
    if (checkoutData.email) {
      upsertUserSession({ email: checkoutData.email, name: guest.fullName })
    }
    persistCheckoutBasket(eventId, payload)
    persistOrderConfirmation(payload)
    persistLastOrderEventId(eventId)
    navigate(orderConfirmationPath(eventId), { state: payload })
  }

  return (
    <div className="checkoutPage guestCheckoutPage">
      <div className="checkoutPage__shell">
        <Link
          className="checkoutPage__back"
          to={connectPath(eventId)}
          state={stripped}
          onClick={() => clearCheckoutFormDrafts(eventId)}
        >
          <span className="checkoutPage__backArrow" aria-hidden>
            ←
          </span>
          Confirm and pay
        </Link>

        <div className="checkoutGrid">
          <section className="checkoutGrid__payment guestCheckoutPanel checkoutPayStickyHost">
            <CheckoutDonation selection={donation} onChange={setDonation} />
            <CheckoutPaymentMethods
              total={checkoutData.total}
              serviceFee={checkoutData.serviceFee}
              onPay={onPay}
              submitType="button"
            />
          </section>

          <aside className="checkoutGrid__summary" aria-label="Order summary">
            <CheckoutSummaryCard data={summaryPayload} />
          </aside>
        </div>
      </div>
    </div>
  )
}
