'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import ProductUploadForm from '@/components/ProductUploadForm';
import { getProducts, ApiProduct, API_BASE_URL } from '@/services';
import { Pagination } from '@/services/types/product.types';
import { createPortal } from 'react-dom';

// Función para mapear ApiProduct a Product
function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  // Construir URL completa de la imagen
  let imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3ESin Imagen%3C/text%3E%3C/svg%3E';
  if (apiProduct.images && apiProduct.images.length > 0) {
    const imagePath = apiProduct.images[0];
    // Si es una imagen base64 (data:image/...), usarla directamente
    if (imagePath.startsWith('data:image/')) {
      imageUrl = imagePath;
    } 
    // Si ya es una URL completa (http/https), usarla directamente
    else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      imageUrl = imagePath;
    } 
    // Si es una ruta relativa, construir la URL completa
    else {
      imageUrl = `${API_BASE_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
    }
  }
  
  // Convertir specifications a Record<string, string>
  let specifications: Record<string, string> | undefined;
  if (apiProduct.specifications) {
    if (Array.isArray(apiProduct.specifications)) {
      // Si es un array, convertirlo a un objeto
      specifications = apiProduct.specifications.reduce((acc, spec, index) => {
        acc[`Especificación ${index + 1}`] = typeof spec === 'string' ? spec : String(spec);
        return acc;
      }, {} as Record<string, string>);
    } else {
      // Si ya es un objeto, usarlo directamente
      specifications = apiProduct.specifications as Record<string, string>;
    }
  }
  
  // Convertir createdAt a string
  let createdAt: string;
  if (typeof apiProduct.createdAt === 'string') {
    createdAt = apiProduct.createdAt;
  } else {
    // Si es FirestoreTimestamp, convertir a ISO string
    const timestamp = apiProduct.createdAt as { _seconds: number; _nanoseconds: number };
    createdAt = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000).toISOString();
  }
  
  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.comparePrice > 0 ? apiProduct.comparePrice : undefined,
    image: imageUrl,
    category: apiProduct.category?.name || 'Sin categoría',
    rating: 0,
    reviews: 0,
    inStock: apiProduct.inStock,
    badge: apiProduct.badge || undefined,
    description: apiProduct.description,
    specifications: specifications,
    type: apiProduct.productType || 'componente', // Valor por defecto si no viene
    createdAt: createdAt,
  };
}

export default function AdminPage() {
  // Solo usar localProducts si el usuario explícitamente cambia a modo local
  const { products: localProducts, deleteProduct, updateProduct } = useProducts();
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useApiData, setUseApiData] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [apiLoaded, setApiLoaded] = useState(false);
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'componente' | 'computadora'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalClosing, setModalClosing] = useState(false);

  // Cargar productos del API
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getProducts({ 
          limit: 100, // Cargar muchos productos para admin
          isActive: true 
        });
        const mappedProducts = response.data.products.map(mapApiProductToProduct);
        setApiProducts(mappedProducts);
        setPagination(response.data.pagination);
        setApiLoaded(true);
      } catch (err) {
        console.error('Error al cargar productos del API:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar productos');
        setApiProducts([]); // No mostrar datos quemados, array vacío
        setPagination(null);
        setApiLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (useApiData) {
      loadProducts();
    } else {
      setIsLoading(false);
      setApiLoaded(false);
    }
  }, [useApiData, refreshKey]);

  // Función para cerrar el modal con animación
  const handleCloseModal = useCallback(() => {
    setModalClosing(true);
    setTimeout(() => {
      setShowUploadForm(false);
      setEditingProduct(null);
      setModalClosing(false);
    }, 300);
  }, []);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (showUploadForm || editingProduct)) {
        handleCloseModal();
      }
    };

    if (showUploadForm || editingProduct) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showUploadForm, editingProduct, handleCloseModal]);

  // Usar productos del API o del localStorage según el flag
  // Solo usar localProducts si el usuario explícitamente cambió a modo local
  const products = useApiData ? apiProducts : localProducts;

  const filteredProducts = products.filter(product => {
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  const handleToggleStock = (id: string, currentStock: boolean) => {
    updateProduct(id, { inStock: !currentStock });
  };

  const handleSuccess = () => {
    handleCloseModal();
    // Refrescar productos del API después de crear/actualizar
    if (useApiData) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Administración de Productos</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Gestiona todos los productos de tu tienda. Agrega, edita y elimina componentes y computadoras.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setUseApiData(false);
                setError(null);
              }}
              className="text-red-600 hover:text-red-800 underline text-sm ml-4"
            >
              Cambiar a datos locales
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-custom p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowUploadForm(true);
                  setModalClosing(false);
                }}
                className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                + Agregar Producto
              </button>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Todos los productos</option>
                <option value="componente">Componentes</option>
                <option value="computadora">Computadoras</option>
              </select>

              <button
                onClick={() => {
                  if (!useApiData) {
                    setUseApiData(true);
                  } else {
                    // Forzar recarga incrementando el refreshKey
                    setRefreshKey(prev => prev + 1);
                  }
                }}
                disabled={isLoading}
                className="text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={useApiData ? "Recargar productos del API" : "Cambiar a datos del API"}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    {useApiData ? '🔄' : '📡'} {useApiData ? 'API' : 'Local'}
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          {useApiData && pagination && (
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {apiProducts.length} de {pagination.totalItems} productos (Página {pagination.currentPage} de {pagination.totalPages})
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-custom p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{products.length}</div>
            <div className="text-muted">Total Productos</div>
          </div>
          <div className="bg-white rounded-lg shadow-custom p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {products.filter(p => p.type === 'componente').length}
            </div>
            <div className="text-muted">Componentes</div>
          </div>
          <div className="bg-white rounded-lg shadow-custom p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {products.filter(p => p.type === 'computadora').length}
            </div>
            <div className="text-muted">Computadoras</div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-custom overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-primary">
              Productos ({filteredProducts.length})
              {useApiData && <span className="ml-2 text-sm text-gray-500">(desde API)</span>}
            </h2>
          </div>

          {/* Loading State */}
          {isLoading && useApiData ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Cargando productos del API...</p>
            </div>
          ) : error && useApiData && !apiLoaded ? (
            <div className="p-8 text-center text-muted">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg mb-2">No se pudieron cargar los productos</p>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg mb-2">No hay productos</p>
              <p className="text-sm">
                {useApiData 
                  ? 'No se encontraron productos en el API' 
                  : 'Agrega tu primer producto para comenzar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center min-w-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23e5e7eb" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ESin Imagen%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div 
                              className="text-sm font-medium text-gray-900 truncate"
                              title={product.name}
                            >
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.type === 'componente' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.type === 'componente' ? 'Componente' : 'Computadora'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${product.price.toLocaleString()}
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            ${product.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStock(product.id, product.inStock || false)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.inStock ? 'En Stock' : 'Agotado'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setShowUploadForm(false);
                              setEditingProduct(product);
                              setModalClosing(false);
                            }}
                            className="text-primary hover:text-secondary transition-colors duration-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && typeof window !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            modalClosing 
              ? 'opacity-0 pointer-events-none' 
              : 'opacity-100'
          }`}
          onClick={handleBackdropClick}
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        >
          {/* Backdrop con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
          
          {/* Modal Content */}
          <div 
            className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
              modalClosing 
                ? 'scale-95 translate-y-4 opacity-0' 
                : 'scale-100 translate-y-0 opacity-100'
            }`}
          >
            {/* Header con gradiente y botón de cerrar */}
            <div className="bg-gradient-primary text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
              <h2 className="text-xl font-bold">
                Agregar Nuevo Producto
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 transition-all duration-200 transform hover:scale-110 hover:rotate-90 p-2 rounded-full hover:bg-white/20"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content con scroll suave */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] scroll-smooth">
              <ProductUploadForm 
                editingProduct={null}
                onSuccess={handleSuccess} 
                onCancel={handleCloseModal}
                hideTitle={true}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Form Modal */}
      {editingProduct && typeof window !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            modalClosing 
              ? 'opacity-0 pointer-events-none' 
              : 'opacity-100'
          }`}
          onClick={handleBackdropClick}
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        >
          {/* Backdrop con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
          
          {/* Modal Content */}
          <div 
            className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
              modalClosing 
                ? 'scale-95 translate-y-4 opacity-0' 
                : 'scale-100 translate-y-0 opacity-100'
            }`}
          >
            {/* Header con gradiente y botón de cerrar */}
            <div className="bg-gradient-primary text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
              <h2 className="text-xl font-bold">
                Editar Producto: {editingProduct.name}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 transition-all duration-200 transform hover:scale-110 hover:rotate-90 p-2 rounded-full hover:bg-white/20"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content con scroll suave */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] scroll-smooth">
              <ProductUploadForm 
                editingProduct={editingProduct}
                onSuccess={handleSuccess} 
                onCancel={handleCloseModal}
                hideTitle={true}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
