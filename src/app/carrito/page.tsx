'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartSummary,
    isHydrated,
    isLoading,
    isAuthenticated,
    loadCartFromServer,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const summary = getCartSummary();

  // Cargar carrito del servidor cuando el componente se monta
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      loadCartFromServer();
    }
  }, [isHydrated, isAuthenticated, loadCartFromServer]);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/carrito');
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (confirm('¿Estás seguro de que deseas limpiar todo el carrito?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simular proceso de checkout
    setTimeout(() => {
      alert('¡Gracias por tu compra! Redirigiendo al WhatsApp para completar el pedido...');
      const phoneNumber = "573118993888";
      const message = `Hola! Quiero comprar estos productos:\n\n${cartItems.map(item => 
        `• ${item.product.name} x${item.quantity} - $${item.product.price.toLocaleString()}`
      ).join('\n')}\n\nTotal: $${summary.totalPrice.toLocaleString()}`;
      
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');
      
      setIsCheckingOut(false);
      clearCart();
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Mostrar loading mientras se hidrata o verifica autenticación
  if (!isHydrated || (!isAuthenticated && isHydrated)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Carrito de Compras</h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Revisa tus productos seleccionados y completa tu compra.
            </p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">
              {!isAuthenticated ? 'Redirigiendo al inicio de sesión...' : 'Cargando carrito...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Carrito de Compras</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Revisa tus productos seleccionados y completa tu compra.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-gray-700">Actualizando carrito...</span>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-custom p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Parece que no has agregado ningún producto a tu carrito. 
              Explora nuestros componentes y computadoras para encontrar lo que necesitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/componentes"
                className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Ver Componentes
              </Link>
              <Link
                href="/computadoras"
                className="bg-gradient-accent text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Ver Computadoras
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Productos ({summary.totalItems})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Limpiar Carrito
                  </button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const isUpdating = updatingItems.has(item.product.id);
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-gray-50 rounded-lg p-4 flex items-center space-x-4 transition-opacity ${
                          isUpdating ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Product Image */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={item.product.image || 'https://via.placeholder.com/96'}
                            alt={item.product.name}
                            fill
                            sizes="96px"
                            className="object-cover rounded-lg"
                            unoptimized={item.product.image?.startsWith('data:image/')}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">{item.product.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-semibold text-primary">
                              {formatPrice(item.product.price)}
                            </span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={isUpdating || isLoading}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {isUpdating ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={isUpdating || isLoading}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          disabled={isUpdating || isLoading}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 disabled:opacity-50"
                          title="Eliminar del carrito"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-custom p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>
                
                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Productos ({summary.totalItems})</span>
                    <span className="font-semibold">{formatPrice(summary.totalPrice)}</span>
                  </div>
                  
                  {summary.totalSavings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ahorro</span>
                      <span className="text-green-600 font-semibold">
                        -{formatPrice(summary.totalSavings)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(summary.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || isLoading}
                  className="w-full bg-gradient-primary text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isCheckingOut ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    'Completar Compra por WhatsApp'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mb-4">
                  Serás redirigido a WhatsApp para completar tu pedido
                </p>

                {/* Continue Shopping */}
                <Link
                  href="/componentes"
                  className="block w-full text-center text-primary hover:text-secondary font-medium py-2 transition-colors"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
