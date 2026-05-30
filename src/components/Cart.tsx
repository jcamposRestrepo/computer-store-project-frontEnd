'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart, CartItem } from '@/hooks/useCart';
import { Product } from '@/hooks/useProducts';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartSummary,
    isHydrated 
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const summary = getCartSummary();

  if (!isOpen) return null;

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
      onClose();
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-primary text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Carrito de Compras</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500 mb-6">Agrega algunos productos para comenzar tu compra</p>
              <button
                onClick={onClose}
                className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* Items List */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="80px"
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="Eliminar del carrito"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="text-center mb-6">
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Limpiar Carrito
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Summary and Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t bg-gray-50 p-6">
            {/* Summary */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Productos ({summary.totalItems})</span>
                <span className="font-semibold">{formatPrice(summary.totalPrice)}</span>
              </div>
              
              {summary.totalSavings > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Ahorro</span>
                  <span className="text-green-600 font-semibold">
                    -{formatPrice(summary.totalSavings)}
                  </span>
                </div>
              )}
              
              <div className="border-t pt-2">
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
              disabled={isCheckingOut}
              className="w-full bg-gradient-primary text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-xs text-gray-500 text-center mt-3">
              Serás redirigido a WhatsApp para completar tu pedido
            </p>
          </div>
        )}
      </div>
    </div>
  );
}









































































