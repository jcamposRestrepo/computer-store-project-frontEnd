import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function HomePage() {
  const categories = [
    {
      name: 'Procesadores',
      description: 'Los mejores procesadores Intel y AMD para tu PC',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&h=300&fit=crop',
      productCount: 45,
      href: '/componentes/procesadores'
    },
    {
      name: 'Tarjetas Gráficas',
      description: 'GPUs de última generación para gaming y trabajo',
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&h=300&fit=crop',
      productCount: 32,
      href: '/componentes/tarjetas-graficas'
    },
    {
      name: 'Memoria RAM',
      description: 'Memoria de alta velocidad para máximo rendimiento',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
      productCount: 28,
      href: '/componentes/memoria-ram'
    },
    {
      name: 'Computadoras Armadas',
      description: 'PCs completas listas para usar',
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&h=300&fit=crop',
      productCount: 15,
      href: '/computadoras'
    }
  ];

  const featuredProducts = [
    {
      id: '1',
      name: 'Intel Core i7-13700K',
      price: 450000,
      originalPrice: 520000,
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
      category: 'Procesadores',
      rating: 4.8,
      reviews: 156,
      badge: 'Nuevo',
      type: 'componente' as const,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'NVIDIA RTX 4070 Ti',
      price: 850000,
      originalPrice: 950000,
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
      category: 'Tarjetas Gráficas',
      rating: 4.9,
      reviews: 89,
      badge: 'Popular',
      type: 'componente' as const,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Corsair Vengeance LPX 32GB',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      category: 'Memoria RAM',
      rating: 4.7,
      reviews: 203,
      inStock: true,
      type: 'componente' as const,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'PC Gaming Pro RTX 4080',
      price: 2500000,
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
      category: 'Computadoras Completas',
      rating: 4.9,
      reviews: 67,
      badge: 'Destacado',
      type: 'computadora' as const,
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Construye tu PC Ideal"
        subtitle="Encuentra los mejores componentes y computadoras armadas para gaming, trabajo y entretenimiento"
        backgroundImages={[
          "https://grupormultimedio.com/wp-content/uploads/2024/09/pc-gamer.jpg",
          "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1920&h=1080&fit=crop",
          "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1920&h=1080&fit=crop",
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1920&h=1080&fit=crop"
        ]}
        ctaText="Explorar Productos"
        ctaHref="/componentes"
        secondaryCtaText="Armar PC"
        secondaryCtaHref="/armar-pc"
        autoPlayInterval={5000}
      />

      {/* Animated Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2 animate-count-up">500+</div>
              <div className="text-lg opacity-90">Productos Disponibles</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2 animate-count-up">10K+</div>
              <div className="text-lg opacity-90">Clientes Satisfechos</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2 animate-count-up">5+</div>
              <div className="text-lg opacity-90">Años de Experiencia</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl md:text-5xl font-bold mb-2 animate-count-up">24/7</div>
              <div className="text-lg opacity-90">Soporte Técnico</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4 animate-fade-in-up">
              Categorías Principales
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Explora nuestras categorías de productos y encuentra exactamente lo que necesitas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="animate-fade-in-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <CategoryCard {...category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4 animate-fade-in-up">
              Productos Destacados
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Los productos más populares y mejor valorados por nuestros clientes
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <a
              href="/componentes"
              className="bg-gradient-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 inline-block"
            >
              Ver Todos los Productos
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4 animate-fade-in-up">
              ¿Por qué elegir TechStore?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Garantía Extendida</h3>
              <p className="text-muted">Todos nuestros productos cuentan con garantía oficial y soporte técnico especializado.</p>
            </div>
            
            <div className="text-center animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
              <p className="text-muted">Despacho en 24 horas para productos en stock. Envío gratis en compras superiores a $500.000.</p>
            </div>
            
            <div className="text-center animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
              <div className="bg-gradient-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75 9.75 9.75 0 019.75-9.75z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Asesoría Especializada</h3>
              <p className="text-muted">Nuestros técnicos te ayudan a elegir los componentes perfectos para tu presupuesto y necesidades.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-accent to-sky-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¡Mantente al Día!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Recibe ofertas exclusivas y las últimas novedades en tecnología
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-accent px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 hover:scale-105">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton 
        phoneNumber="573118993888"
        message="Hola! Me interesa conocer más sobre sus productos de computación. ¿Podrían ayudarme?"
      />
    </div>
  );
}