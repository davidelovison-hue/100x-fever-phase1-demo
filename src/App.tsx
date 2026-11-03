import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { CartProvider } from './lib/cartContext';
import { CheckoutLayout } from './layouts/CheckoutLayout';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConnectPage } from './pages/ConnectPage';
import { GuestCheckoutPage } from './pages/GuestCheckoutPage';
import { HandoffPlanPage } from './pages/HandoffPlanPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { PackagesHandoverPage } from './pages/PackagesHandoverPage';
import './checkoutTheme.css';

/** Old `/addons` route → same ForcedStepper page on #addons. */
function AddonsRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '..', search, hash: 'addons' }} replace relative="path" />;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTop />
      <CartProvider>
        <Routes>
          <Route path="/" element={<PackagesHandoverPage />} />

          {/* Fever ForcedStepper handoff — Package → Add-ons */}
          <Route path="/event/:eventId" element={<HandoffPlanPage />} />
          <Route path="/event/:eventId/addons" element={<AddonsRedirect />} />

          <Route path="/event/:eventId" element={<CheckoutLayout />}>
            <Route path="connect" element={<ConnectPage />} />
            <Route path="guest-checkout" element={<GuestCheckoutPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="confirmation" element={<OrderConfirmationPage />} />
            <Route path="pmr-questions" element={<Navigate to="connect" replace />} />
            <Route path="post-booking" element={<Navigate to="confirmation" replace />} />
          </Route>

          <Route path="/account" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
