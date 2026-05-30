'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart, getItemQuantity, isHydrated, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const { id, name, price, originalPrice, image, category, rating = 0, reviews = 0, inStock = true, badge } = product;
  
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isProductInCart = isInCart(id);
  const cartQuantity = getItemQuantity(id);

  const handleAddToCart = async () => {
    if (inStock && isHydrated && !isAdding) {
      setIsAdding(true);
      try {
        await addToCart(product);
      } finally {
        setIsAdding(false);
      }
    }
  };

  // Asegurar que siempre tengamos una URL válida
  const imageUrl = image || 'https://via.placeholder.com/400x400?text=No+Image';
  
  // Verificar si la imagen es base64
  const isBase64Image = imageUrl.startsWith('data:image/');

  return (
    <div className="bg-white rounded-lg shadow-custom hover:shadow-xl transition-all duration-300 overflow-hidden group hover-lift">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized={isBase64Image}
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-md text-xs font-semibold animate-pulse-glow">
            {badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold animate-bounce">
            -{discount}%
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Agotado</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button className="bg-white text-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors duration-200 transform translate-y-4 group-hover:translate-y-0">
            Ver Detalles
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-muted mb-1">{category}</div>
        <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 transition-colors duration-200 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted ml-2">({reviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary group-hover:scale-105 transition-transform duration-200">
              ${price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-lg text-muted line-through">
                ${originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={handleAddToCart}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 hover:scale-105 ${
              inStock && isHydrated && !isAdding
                ? isProductInCart
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-primary hover:bg-secondary text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!inStock || !isHydrated || isAdding}
          >
            {!isHydrated ? 'Cargando...' : 
             isAdding ? (
               <span className="flex items-center justify-center">
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Agregando...
               </span>
             ) :
             !inStock ? 'Agotado' : 
             isProductInCart ? `En Carrito (${cartQuantity})` : 'Agregar al Carrito'}
          </button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:border-primary">
            <svg className="w-5 h-5 text-gray-600 hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
