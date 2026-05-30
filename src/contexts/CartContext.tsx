'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/hooks/useProducts';
import * as cartAPI from '@/services/cartService';

export interface CartItem {
  id: string;
  cartItemId?: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  totalOriginalPrice: number;
  totalSavings: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getCartSummary: () => CartSummary;
  isHydrated: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  loadCartFromServer: () => Promise<void>;
  requireAuth: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Cargar carrito desde el servidor
  const loadCartFromServer = useCallback(async () => {
    if (!cartAPI.isAuthenticated()) {
      setCartItems([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await cartAPI.getCart();
      
      console.log('Respuesta del servidor (getCart):', response);
      
      if (response.success && response.data) {
        const serverItems: CartItem[] = response.data.items.map(item => {
          // Log para depurar los IDs
          console.log('Item del servidor:', {
            id: item.id,
            cartItemId: item.cartItemId,
            productId: item.product?.id,
          });
          
          return {
            id: item.id,
            cartItemId: item.cartItemId || item.id,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              originalPrice: item.product.originalPrice,
              image: item.product.image || (item.product.images?.[0]),
              category: item.product.category,
              type: item.product.type,
              inStock: item.product.inStock ?? true,
            } as Product,
            quantity: item.quantity,
            addedAt: item.addedAt || new Date().toISOString(),
          };
        });
        
        console.log('Items procesados:', serverItems);
        setCartItems(serverItems);
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicializar al cargar y verificar autenticación periódicamente
  useEffect(() => {
    let previousAuth = false;
    let isInitialized = false;
    
    const checkAndUpdateAuth = async () => {
      const currentAuth = cartAPI.isAuthenticated();
      
      // Primera ejecución: inicializar
      if (!isInitialized) {
        previousAuth = currentAuth;
        setIsAuthenticated(currentAuth);
        
        if (currentAuth) {
          console.log('CartContext: Usuario autenticado al iniciar, cargando carrito...');
          await loadCartFromServer();
        }
        
        setIsHydrated(true);
        isInitialized = true;
        return;
      }
      
      // Detectar cambios en la autenticación
      if (currentAuth !== previousAuth) {
        console.log('CartContext: Cambio de autenticación detectado:', { previousAuth, currentAuth });
        setIsAuthenticated(currentAuth);
        
        if (currentAuth && !previousAuth) {
          // Usuario acaba de iniciar sesión
          console.log('CartContext: Usuario inició sesión, cargando carrito...');
          await loadCartFromServer();
        } else if (!currentAuth && previousAuth) {
          // Usuario acaba de cerrar sesión
          console.log('CartContext: Usuario cerró sesión, limpiando carrito...');
          setCartItems([]);
        }
        
        previousAuth = currentAuth;
      }
    };
    
    // Verificar inmediatamente
    checkAndUpdateAuth();
    
    // Verificar cada segundo para detectar cambios de sesión rápidamente
    const interval = setInterval(checkAndUpdateAuth, 1000);
    
    return () => clearInterval(interval);
  }, [loadCartFromServer]);

  // Escuchar cambios en la autenticación desde otros tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'firebase_token' || e.key === 'auth_token') {
        const newAuth = cartAPI.isAuthenticated();
        setIsAuthenticated(newAuth);
        
        if (e.newValue && newAuth) {
          // Usuario inició sesión desde otro tab
          console.log('CartContext: Inicio de sesión detectado desde otro tab');
          loadCartFromServer();
        } else if (!e.newValue) {
          // Usuario cerró sesión desde otro tab
          console.log('CartContext: Cierre de sesión detectado desde otro tab');
          setCartItems([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadCartFromServer]);

  // Verificar autenticación y redirigir si no está autenticado
  const requireAuth = useCallback((): boolean => {
    const auth = cartAPI.isAuthenticated();
    if (!auth) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return false;
    }
    return true;
  }, [router]);

  // Agregar producto al carrito (requiere autenticación)
  const addToCart = useCallback(async (product: Product, quantity: number = 1): Promise<boolean> => {
    // Verificar autenticación
    if (!requireAuth()) {
      return false;
    }

    setIsLoading(true);
    
    try {
      // Llamar al API del backend con los datos del producto
      await cartAPI.addToCart(product.id, quantity, {
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        type: product.type,
        inStock: product.inStock,
      });
      
      // Recargar carrito desde el servidor para obtener los IDs correctos
      await loadCartFromServer();
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error instanceof Error && error.message.includes('token')) {
        requireAuth();
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [requireAuth, loadCartFromServer]);

  // Remover producto del carrito
  const removeFromCart = useCallback(async (productId: string) => {
    if (!cartAPI.isAuthenticated()) {
      return;
    }

    const itemToRemove = cartItems.find(item => item.product.id === productId);
    console.log('Intentando eliminar item:', { productId, itemToRemove });
    
    if (!itemToRemove?.cartItemId) {
      console.warn('No se encontró cartItemId para el producto:', productId);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Enviando DELETE con cartItemId:', itemToRemove.cartItemId);
      await cartAPI.removeFromCart(itemToRemove.cartItemId);
      // Recargar carrito desde el servidor
      await loadCartFromServer();
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, loadCartFromServer]);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!cartAPI.isAuthenticated()) {
      return;
    }

    const itemToUpdate = cartItems.find(item => item.product.id === productId);
    if (!itemToUpdate?.cartItemId) {
      return;
    }

    setIsLoading(true);
    
    try {
      await cartAPI.updateCartItem(itemToUpdate.cartItemId, quantity);
      // Recargar carrito desde el servidor
      await loadCartFromServer();
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, removeFromCart, loadCartFromServer]);

  // Limpiar carrito completamente
  const clearCart = useCallback(async () => {
    console.log('clearCart: iniciando...');
    
    if (!cartAPI.isAuthenticated()) {
      console.log('clearCart: usuario no autenticado');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('clearCart: llamando al API...');
      const result = await cartAPI.clearCart();
      console.log('clearCart: resultado del API:', result);
      
      // Limpiar estado local inmediatamente
      setCartItems([]);
      console.log('clearCart: carrito limpiado localmente');
      
      // Recargar del servidor para confirmar
      await loadCartFromServer();
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Intentar recargar de todos modos para ver el estado real
      await loadCartFromServer();
    } finally {
      setIsLoading(false);
    }
  }, [loadCartFromServer]);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => item.product.id === productId);
  }, [cartItems]);

  // Obtener cantidad de un producto en el carrito
  const getItemQuantity = useCallback((productId: string) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Calcular resumen del carrito
  const getCartSummary = useCallback((): CartSummary => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalOriginalPrice = cartItems.reduce((sum, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      return sum + (originalPrice * item.quantity);
    }, 0);
    const totalSavings = totalOriginalPrice - totalPrice;

    return {
      totalItems,
      totalPrice,
      totalOriginalPrice,
      totalSavings,
    };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
        getCartSummary,
        isHydrated,
        isLoading,
        isAuthenticated,
        loadCartFromServer,
        requireAuth,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
