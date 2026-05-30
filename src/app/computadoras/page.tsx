'use client';

import ProductCard from '@/components/ProductCard';
import { Product } from '@/hooks/useProducts';
import { useState, useMemo, useEffect } from 'react';
import { getProducts, ApiProduct, API_BASE_URL } from '@/services';

// Función para mapear ApiProduct a Product
function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  // Construir URL completa de la imagen
  let imageUrl = 'https://via.placeholder.com/400x400?text=No+Image';
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
    specifications: apiProduct.specifications,
    type: apiProduct.productType,
    createdAt: apiProduct.createdAt,
  };
}

export default function ComputadorasPage() {
  const [computadoras, setComputadoras] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
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
        const mappedProducts = response.data.products
          .filter(p => p.productType === 'computadora')
          .map(mapApiProductToProduct);
        setComputadoras(mappedProducts);
      } catch (err) {
        console.error('Error al cargar computadoras del API:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar computadoras');
        setComputadoras([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => [
    { name: 'Todas', count: computadoras.length, active: selectedCategory === 'Todas' },
    { name: 'Gaming', count: computadoras.filter(c => c.category === 'Gaming').length, active: selectedCategory === 'Gaming' },
    { name: 'Workstation', count: computadoras.filter(c => c.category === 'Workstation').length, active: selectedCategory === 'Workstation' },
    { name: 'Oficina', count: computadoras.filter(c => c.category === 'Oficina').length, active: selectedCategory === 'Oficina' },
    { name: 'Streaming', count: computadoras.filter(c => c.category === 'Streaming').length, active: selectedCategory === 'Streaming' },
    { name: 'Content Creation', count: computadoras.filter(c => c.category === 'Content Creation').length, active: selectedCategory === 'Content Creation' }
  ], [computadoras, selectedCategory]);

  const filteredComputadoras = selectedCategory === 'Todas' 
    ? computadoras 
    : computadoras.filter(c => c.category === selectedCategory);

  const sortedComputadoras = [...filteredComputadoras].sort((a, b) => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Computadoras Armadas</h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Computadoras completas listas para usar. Desde PCs de presupuesto hasta 
              máquinas de gaming de alta gama, todas armadas por nuestros expertos.
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Computadoras Armadas</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Computadoras completas listas para usar. Desde PCs de presupuesto hasta 
            máquinas de gaming de alta gama, todas armadas por nuestros expertos.
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
                    Mostrando {sortedComputadoras.length} productos
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedComputadoras.length === 0 ? (
              <div className="bg-white rounded-lg shadow-custom p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay computadoras disponibles</h3>
                <p className="text-gray-500 mb-4">No se encontraron computadoras en esta categoría.</p>
                <a
                  href="/admin"
                  className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 inline-block"
                >
                  Agregar Computadoras
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedComputadoras.map((product) => (
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
