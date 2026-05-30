'use client';

import ProductCard from '@/components/ProductCard';
import { Product } from '@/hooks/useProducts';
import { useState, useMemo, useEffect } from 'react';
import { getProducts, ApiProduct, API_BASE_URL } from '@/services';

// Función para convertir timestamp de Firestore a string ISO
function convertFirestoreTimestamp(timestamp: string | { _seconds: number; _nanoseconds: number }): string {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  // Convertir timestamp de Firestore a Date y luego a ISO string
  const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  return date.toISOString();
}

// Función para convertir specifications (puede ser array de strings o objeto)
function convertSpecifications(specs: Record<string, string> | string[] | undefined): Record<string, string> {
  if (!specs) return {};
  if (Array.isArray(specs)) {
    // Si es un array de strings, convertir a objeto
    const result: Record<string, string> = {};
    specs.forEach((spec, index) => {
      result[`Especificación ${index + 1}`] = spec;
    });
    return result;
  }
  return specs;
}

// Función para validar si una URL es válida
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Función para construir una URL válida de imagen
function buildImageUrl(imagePath: string | null | undefined): string {
  const placeholderUrl = 'https://via.placeholder.com/400x400?text=No+Image';
  
  // Si no hay imagen, retornar placeholder
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return placeholderUrl;
  }
  
  // Si es una imagen base64 (data:image/...), usarla directamente
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  // Si ya es una URL completa y válida, usarla
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return isValidUrl(imagePath) ? imagePath : placeholderUrl;
  }
  
  // Si API_BASE_URL no está definido o es inválido, usar placeholder
  if (!API_BASE_URL || typeof API_BASE_URL !== 'string') {
    return placeholderUrl;
  }
  
  // Si es una ruta relativa, construir la URL completa
  // Asegurarse de que la ruta comience con /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${API_BASE_URL}${normalizedPath}`;
  
  // Validar que la URL construida sea válida
  return isValidUrl(fullUrl) ? fullUrl : placeholderUrl;
}

// Función para mapear ApiProduct a Product
function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  // Construir URL completa de la imagen
  const imageUrl = buildImageUrl(apiProduct.images?.[0]);
  
  // Determinar si está en stock (puede venir como inStock o inferirse de stock)
  const inStock = apiProduct.inStock !== undefined 
    ? apiProduct.inStock 
    : (apiProduct.stock > 0);
  
  // Determinar el tipo de producto (puede no venir en la respuesta, usar 'componente' por defecto para esta página)
  const productType = apiProduct.productType || 'componente';
  
  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    price: apiProduct.price,
    originalPrice: apiProduct.comparePrice > 0 ? apiProduct.comparePrice : undefined,
    image: imageUrl,
    category: apiProduct.category?.name || 'Sin categoría',
    rating: 0,
    reviews: 0,
    inStock: inStock,
    badge: apiProduct.badge || undefined,
    description: apiProduct.description,
    specifications: convertSpecifications(apiProduct.specifications),
    type: productType,
    createdAt: convertFirestoreTimestamp(apiProduct.createdAt),
  };
}

export default function ComponentesPage() {
  const [componentes, setComponentes] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('relevancia');

  // Cargar productos del API
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getProducts({ 
          limit: 100,
          isActive: true 
        });
        // Filtrar componentes: si productType viene, filtrar por 'componente', 
        // si no viene, asumir que todos son componentes (ya que estamos en la página de componentes)
        const mappedProducts = response.data.products
          .filter(p => !p.productType || p.productType === 'componente')
          .map(mapApiProductToProduct);
        setComponentes(mappedProducts);
      } catch (err) {
        console.error('Error al cargar componentes del API:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar componentes');
        setComponentes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => [
    { name: 'Todos', count: componentes.length, active: selectedCategory === 'Todos' },
    { name: 'Procesadores', count: componentes.filter(c => c.category === 'Procesadores').length, active: selectedCategory === 'Procesadores' },
    { name: 'Tarjetas Gráficas', count: componentes.filter(c => c.category === 'Tarjetas Gráficas').length, active: selectedCategory === 'Tarjetas Gráficas' },
    { name: 'Memoria RAM', count: componentes.filter(c => c.category === 'Memoria RAM').length, active: selectedCategory === 'Memoria RAM' },
    { name: 'Almacenamiento', count: componentes.filter(c => c.category === 'Almacenamiento').length, active: selectedCategory === 'Almacenamiento' },
    { name: 'Placas Base', count: componentes.filter(c => c.category === 'Placas Base').length, active: selectedCategory === 'Placas Base' },
    { name: 'Fuentes de Poder', count: componentes.filter(c => c.category === 'Fuentes de Poder').length, active: selectedCategory === 'Fuentes de Poder' },
    { name: 'Refrigeración', count: componentes.filter(c => c.category === 'Refrigeración').length, active: selectedCategory === 'Refrigeración' },
    { name: 'Gabinetes', count: componentes.filter(c => c.category === 'Gabinetes').length, active: selectedCategory === 'Gabinetes' }
  ], [componentes, selectedCategory]);

  const filteredComponentes = selectedCategory === 'Todos' 
    ? componentes 
    : componentes.filter(c => c.category === selectedCategory);

  const sortedComponentes = [...filteredComponentes].sort((a, b) => {
    switch (sortBy) {
      case 'precio-menor':
        return a.price - b.price;
      case 'precio-mayor':
        return b.price - a.price;
      case 'mejor-valorados':
        return (b.rating || 0) - (a.rating || 0);
      case 'mas-nuevos':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Componentes de PC</h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Encuentra los mejores componentes para armar tu computadora ideal. 
              Procesadores, tarjetas gráficas, memoria RAM y más.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Componentes de PC</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Encuentra los mejores componentes para armar tu computadora ideal. 
            Procesadores, tarjetas gráficas, memoria RAM y más.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-custom p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Categorías</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      category.active
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm opacity-75">({category.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-custom p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Ordenar por:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="relevancia">Relevancia</option>
                    <option value="precio-menor">Precio: Menor a Mayor</option>
                    <option value="precio-mayor">Precio: Mayor a Menor</option>
                    <option value="mejor-valorados">Mejor Valorados</option>
                    <option value="mas-nuevos">Más Nuevos</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {sortedComponentes.length} productos
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedComponentes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-custom p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay componentes disponibles</h3>
                <p className="text-gray-500 mb-4">No se encontraron componentes en esta categoría.</p>
                <a
                  href="/admin"
                  className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 inline-block"
                >
                  Agregar Componentes
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedComponentes.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
