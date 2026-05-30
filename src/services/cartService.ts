import { API_BASE_URL } from './productsService';

// Tipos para el carrito
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  type?: string;
  inStock?: boolean;
  stock?: number;
  sku?: string;
  brand?: string;
}

export interface CartItemAPI {
  id: string;
  cartItemId?: string;
  quantity: number;
  addedAt?: string;
  product: CartProduct;
  total: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItemAPI[];
    subtotal: number;
    itemCount: number;
  };
  message?: string;
}

export interface CartCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface CartValidationResponse {
  success: boolean;
  message: string;
  data?: {
    itemCount: number;
    subtotal: number;
  };
  errors?: Array<{
    productId: string;
    productName: string;
    message: string;
  }>;
}

// Formato que espera el backend para sync y add-multiple
export interface SyncCartItem {
  product: {
    id: string;
    name?: string;
    price?: number;
    originalPrice?: number;
    image?: string;
    category?: string;
    type?: string;
    inStock?: boolean;
  };
  quantity: number;
  addedAt?: string;
}

// Formato legacy (para compatibilidad)
export interface LegacySyncCartItem {
  productId: string;
  productName: string;
  productPrice: number;
  productOriginalPrice?: number;
  productImage?: string;
  productCategory?: string;
  productType?: string;
  productInStock?: boolean;
  quantity: number;
  addedAt?: string;
}

/**
 * Obtiene el token de autenticación del localStorage
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  let token = localStorage.getItem('firebase_token');
  
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  
  return token;
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('firebase_token') || localStorage.getItem('auth_token');
  return !!token;
}

/**
 * Obtiene el carrito del usuario desde el servidor (Firestore)
 */
export async function getCart(): Promise<CartResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/firestore`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error al obtener carrito: ${response.status}`);
    }

    const data: CartResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getCart:', error);
    throw error;
  }
}

/**
 * Agrega un producto al carrito usando la ruta de Firestore
 * Usa add-multiple con un solo item ya que acepta product.id como string
 */
export async function addToCart(
  productId: string, 
  quantity: number = 1,
  productData?: {
    name?: string;
    price?: number;
    originalPrice?: number;
    image?: string;
    category?: string;
    type?: string;
    inStock?: boolean;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    // Usar la ruta add-multiple que acepta product.id como string
    const items: SyncCartItem[] = [{
      product: {
        id: productId,
        ...productData,
      },
      quantity,
      addedAt: new Date().toISOString(),
    }];

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/add-multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error al agregar al carrito: ${response.status}`);
    }

    const data = await response.json();
    return { success: data.success, message: data.message || 'Producto agregado al carrito' };
  } catch (error) {
    console.error('Error en addToCart:', error);
    throw error;
  }
}

/**
 * Actualiza la cantidad de un item en el carrito
 */
export async function updateCartItem(cartItemId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error al actualizar item: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateCartItem:', error);
    throw error;
  }
}

/**
 * Elimina un item del carrito
 */
export async function removeFromCart(cartItemId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error al eliminar item: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en removeFromCart:', error);
    throw error;
  }
}

/**
 * Limpia todo el carrito del usuario (Firestore)
 * Usa /api/v1/cart/firestore/clear para evitar conflicto con /:id
 */
export async function clearCart(): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    console.log('clearCart API: enviando DELETE a /api/v1/cart/firestore/clear');
    
    // Intentar primero con /firestore/clear (ruta más específica)
    let response = await fetch(`${API_BASE_URL}/api/v1/cart/firestore/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Si no existe esa ruta, intentar con /clear-firestore
    if (response.status === 404) {
      console.log('clearCart API: /firestore/clear no encontrado, intentando /clear-firestore');
      response = await fetch(`${API_BASE_URL}/api/v1/cart/clear-firestore`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // Si aún no funciona, intentar con DELETE / (carrito general)
    if (response.status === 404) {
      console.log('clearCart API: intentando DELETE /api/v1/cart');
      response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    console.log('clearCart API: respuesta status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      console.error('clearCart API: error:', errorData);
      throw new Error(errorData.message || `Error al limpiar carrito: ${response.status}`);
    }

    const result = await response.json();
    console.log('clearCart API: resultado:', result);
    return result;
  } catch (error) {
    console.error('Error en clearCart:', error);
    throw error;
  }
}

/**
 * Obtiene el conteo de items en el carrito
 */
export async function getCartCount(): Promise<number> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return 0;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data: CartCountResponse = await response.json();
    return data.data?.count || 0;
  } catch (error) {
    console.error('Error en getCartCount:', error);
    return 0;
  }
}

/**
 * Valida el carrito antes del checkout
 */
export async function validateCart(): Promise<CartValidationResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: CartValidationResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error en validateCart:', error);
    throw error;
  }
}

/**
 * Sincroniza el carrito local con el servidor
 * Útil cuando el usuario inicia sesión y tiene items en el carrito local
 */
export async function syncCart(items: SyncCartItem[]): Promise<CartResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error al sincronizar carrito: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en syncCart:', error);
    throw error;
  }
}

/**
 * Agrega múltiples items al carrito
 */
export async function addMultipleToCart(items: SyncCartItem[]): Promise<CartResponse> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/cart/add-multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error al agregar items: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en addMultipleToCart:', error);
    throw error;
  }
}
