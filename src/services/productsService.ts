import { ProductsResponse, ProductsQueryParams, ApiProduct, Category } from './types/product.types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

/**
 * Construye la URL con query parameters
 */
function buildUrl(endpoint: string, params?: ProductsQueryParams): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Obtiene la lista de productos desde el API
 * @param params - Parámetros de consulta opcionales
 * @returns Promise con la respuesta del API
 */
export async function getProducts(
  params?: ProductsQueryParams
): Promise<ProductsResponse> {
  try {
    const url = buildUrl('/api/v1/products', params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error al obtener productos: ${response.status} ${response.statusText}`
      );
    }

    const data: ProductsResponse = await response.json();
    
    if (!data.success) {
      throw new Error('La respuesta del API no fue exitosa');
    }

    return data;
  } catch (error) {
    console.error('Error en getProducts:', error);
    throw error;
  }
}

/**
 * Obtiene un producto por su ID
 * @param id - ID del producto
 * @returns Promise con el producto
 */
export async function getProductById(id: number): Promise<ApiProduct> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error al obtener producto: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('La respuesta del API no fue exitosa');
    }

    return data.data.product;
  } catch (error) {
    console.error('Error en getProductById:', error);
    throw error;
  }
}

/**
 * Interfaz para crear un producto
 */
export interface CreateProductData {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  categoryId: number | string;
  productType: 'componente' | 'computadora';
  stock?: number;
  inStock: boolean;
  minStock?: number;
  badge?: string;
  brand?: string;
  model?: string;
  sku?: string;
  warranty?: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  specifications?: Record<string, string>;
  tags?: string[];
}

/**
 * Interfaz para actualizar un producto
 */
export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

/**
 * Obtiene todas las categorías disponibles
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error al obtener categorías: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.success ? data.data.categories : [];
  } catch (error) {
    console.error('Error en getCategories:', error);
    // Retornar array vacío si falla para no romper la UI
    return [];
  }
}

/**
 * Interfaz para crear una categoría
 */
export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string | null;
  image?: string | null;
  isActive?: boolean;
}

/**
 * Crea una nueva categoría en el API
 * @param categoryData - Datos de la categoría a crear
 * @returns Promise con la categoría creada
 */
export async function createCategory(categoryData: CreateCategoryData): Promise<Category> {
  try {
    // Obtener token de autenticación
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    const url = `${API_BASE_URL}/api/v1/categories`;
    console.log('Creando categoría en:', url);
    console.log('Datos de la categoría:', categoryData);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(categoryData),
    }).catch((fetchError) => {
      console.error('Error de fetch:', fetchError);
      // Si es un error de red, proporcionar un mensaje más útil
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        throw new Error(
          `No se pudo conectar con el servidor. Verifica que el servidor esté corriendo en ${API_BASE_URL} y que no haya problemas de CORS.`
        );
      }
      throw fetchError;
    });

    if (!response.ok) {
      let errorMessage = `Error al crear categoría: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'La respuesta del API no fue exitosa');
    }

    return data.data.category;
  } catch (error) {
    console.error('Error en createCategory:', error);
    throw error;
  }
}

/**
 * Busca una categoría por nombre y retorna su ID
 * @param categoryName - Nombre de la categoría
 * @returns ID de la categoría (number | string) o null si no se encuentra
 */
export async function getCategoryIdByName(categoryName: string): Promise<number | string | null> {
  try {
    const categories = await getCategories();
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category?.id || null;
  } catch (error) {
    console.error('Error al buscar categoría:', error);
    return null;
  }
}

/**
 * Verifica si un token es un customToken de Firebase
 */
function isCustomToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    // Los customTokens tienen 'iss' que apunta a Firebase Admin SDK y 'uid' en los claims
    return payload.iss && payload.iss.includes('firebase-adminsdk') && payload.uid !== undefined;
  } catch {
    return false;
  }
}

/**
 * Obtiene el token de autenticación (ID token de Firebase)
 * @returns Token de autenticación o null
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // El backend ahora devuelve idToken directamente, que se guarda en firebase_token
  // Priorizar firebase_token que contiene el ID token
  let token = localStorage.getItem('firebase_token');
  
  // Si no hay firebase_token, intentar usar auth_token como fallback
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión.');
  }
  
  // Verificar que el token no sea un customToken
  if (isCustomToken(token)) {
    console.error('El token guardado es un customToken. Limpiando tokens antiguos...');
    // Limpiar tokens antiguos
    localStorage.removeItem('firebase_token');
    localStorage.removeItem('auth_token');
    throw new Error('El token guardado es un customToken. Por favor, inicia sesión nuevamente para obtener un ID token.');
  }
  
  console.log('Token obtenido correctamente (ID token)');
  return token;
}

/**
 * Crea un nuevo producto en el API
 * @param productData - Datos del producto a crear
 * @returns Promise con el producto creado
 */
export async function createProduct(productData: CreateProductData): Promise<ApiProduct> {
  try {
    // Obtener token de autenticación
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    console.log('Token que se enviará:', token.substring(0, 50) + '...');
    
    // Preparar el body como JSON
    const body: Record<string, unknown> = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      categoryId: productData.categoryId,
      productType: productData.productType,
      inStock: productData.inStock,
    };

    // Campos opcionales
    if (productData.shortDescription) {
      body.shortDescription = productData.shortDescription;
    }
    if (productData.comparePrice !== undefined && productData.comparePrice > 0) {
      body.comparePrice = productData.comparePrice;
    }
    if (productData.stock !== undefined) {
      body.stock = productData.stock;
    }
    if (productData.minStock !== undefined) {
      body.minStock = productData.minStock;
    }
    if (productData.badge) {
      body.badge = productData.badge;
    }
    if (productData.brand) {
      body.brand = productData.brand;
    }
    if (productData.model) {
      body.model = productData.model;
    }
    if (productData.sku) {
      body.sku = productData.sku;
    }
    if (productData.warranty) {
      body.warranty = productData.warranty;
    }
    if (productData.weight !== undefined) {
      body.weight = productData.weight;
    }
    if (productData.dimensions) {
      body.dimensions = productData.dimensions;
    }
    if (productData.images && productData.images.length > 0) {
      body.images = productData.images;
    }
    if (productData.specifications && Object.keys(productData.specifications).length > 0) {
      body.specifications = productData.specifications;
    }
    if (productData.tags && productData.tags.length > 0) {
      body.tags = productData.tags;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(
        errorData.message || `Error al crear producto: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'La respuesta del API no fue exitosa');
    }

    return data.data.product;
  } catch (error) {
    console.error('Error en createProduct:', error);
    throw error;
  }
}

/**
 * Actualiza un producto existente en el API
 * @param productData - Datos del producto a actualizar (debe incluir el ID)
 * @returns Promise con el producto actualizado
 */
export async function updateProduct(productData: UpdateProductData): Promise<ApiProduct> {
  try {
    // Verificar que los campos requeridos existan
    if (!productData.name || !productData.description || productData.price === undefined || 
        !productData.categoryId || !productData.productType || productData.inStock === undefined) {
      throw new Error('Faltan campos requeridos para actualizar el producto');
    }

    // Obtener token de autenticación
    const token = await getAuthToken();

    // Preparar el body como JSON (misma estructura que createProduct)
    const body: Record<string, unknown> = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      categoryId: productData.categoryId,
      productType: productData.productType,
      inStock: productData.inStock,
    };

    // Campos opcionales
    if (productData.shortDescription !== undefined) {
      body.shortDescription = productData.shortDescription;
    }
    if (productData.comparePrice !== undefined && productData.comparePrice > 0) {
      body.comparePrice = productData.comparePrice;
    }
    if (productData.stock !== undefined) {
      body.stock = productData.stock;
    }
    if (productData.minStock !== undefined) {
      body.minStock = productData.minStock;
    }
    if (productData.badge !== undefined) {
      body.badge = productData.badge || '';
    }
    if (productData.brand !== undefined) {
      body.brand = productData.brand;
    }
    if (productData.model !== undefined) {
      body.model = productData.model;
    }
    if (productData.sku !== undefined) {
      body.sku = productData.sku;
    }
    if (productData.warranty !== undefined) {
      body.warranty = productData.warranty;
    }
    if (productData.weight !== undefined) {
      body.weight = productData.weight;
    }
    if (productData.dimensions !== undefined) {
      body.dimensions = productData.dimensions;
    }
    if (productData.images && productData.images.length > 0) {
      body.images = productData.images;
    }
    if (productData.specifications !== undefined) {
      body.specifications = productData.specifications && Object.keys(productData.specifications).length > 0 
        ? productData.specifications 
        : {};
    }
    if (productData.tags !== undefined && productData.tags.length > 0) {
      body.tags = productData.tags;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productData.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(
        errorData.message || `Error al actualizar producto: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'La respuesta del API no fue exitosa');
    }

    return data.data.product;
  } catch (error) {
    console.error('Error en updateProduct:', error);
    throw error;
  }
}

/**
 * Elimina un producto del API
 * @param id - ID del producto a eliminar
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    // Obtener token de autenticación
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(
        errorData.message || `Error al eliminar producto: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    throw error;
  }
}

// Re-exportar tipos para facilitar su uso
export type { ApiProduct, Category, Pagination, ProductsQueryParams } from './types/product.types';

