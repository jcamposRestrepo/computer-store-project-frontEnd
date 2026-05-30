'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function CartButton() {
  const { getCartSummary, isHydrated, isAuthenticated, isLoading } = useCart();
  const summary = getCartSummary();

  if (!isHydrated) return null;

  // Solo mostrar el contador si el usuario está autenticado
  const showCount = isAuthenticated && summary.totalItems > 0;

  return (
    <Link
      href="/carrito"
      className="fixed bottom-6 left-6 z-40 bg-gradient-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Ver carrito de compras"
      title={isAuthenticated ? `Carrito (${summary.totalItems} productos)` : 'Ir al carrito'}
    >
      {/* Cart Icon */}
      <div className="relative">
        {isLoading ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
          </svg>
        )}
        
        {/* Item Count Badge - Solo si está autenticado */}
        {showCount && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
            {summary.totalItems > 99 ? '99+' : summary.totalItems}
          </span>
        )}
      </div>

      {/* Pulse Animation - Solo si tiene items */}
      {showCount && (
        <span className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping"></span>
      )}
    </Link>
  );
}









































































