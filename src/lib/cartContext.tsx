/**
 * Minimal cart stub — OrderConfirmationPage (exact Gaerten screen) only needs clearCart.
 */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

type CartContextValue = {
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const clearCart = useCallback(() => {}, []);
  const value = useMemo(() => ({ clearCart }), [clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
