'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { authService, User } from '@/services/authService';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticatedLocal, setIsAuthenticatedLocal] = useState(false);
  const { 
    getCartSummary, 
    isHydrated, 
    isAuthenticated: isCartAuthenticated,
    loadCartFromServer 
  } = useCart();
  const router = useRouter();
  const cartSummary = getCartSummary();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = authService.isAuthenticated();
      const wasAuthenticated = isAuthenticatedLocal;
      setIsAuthenticatedLocal(auth);
      
      if (auth) {
        const userData = authService.getUser();
        setUser(userData);
        
        // Si acaba de iniciar sesión, cargar el carrito
        if (!wasAuthenticated && auth) {
          console.log('Navbar: Usuario acaba de iniciar sesión, cargando carrito...');
          await loadCartFromServer();
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    // Verificar cada 5 segundos para mantener actualizado el estado
    const interval = setInterval(checkAuth, 5000);
    
    // Cerrar menú de usuario al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isAuthenticatedLocal, loadCartFromServer]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticatedLocal(false);
    setUser(null);
    setIsUserMenuOpen(false);
    // El carrito se limpiará automáticamente en el CartContext
    // porque detectará que ya no hay token
    router.push('/');
    // Recargar para limpiar el estado del carrito
    window.location.href = '/';
  };
  
  // Usar la autenticación local para la UI
  const isAuthenticated = isAuthenticatedLocal;

  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastNameInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastNameInitial}`;
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  const allNavigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Componentes', href: '/componentes' },
    { name: 'Computadoras', href: '/computadoras' },
    { name: 'Armar PC', href: '/armar-pc' },
    { name: 'Admin', href: '/admin', requiresAdmin: true },
    { name: 'Contacto', href: '/contacto' },
  ];

  // Filtrar navegación basada en permisos
  const navigation = allNavigation.filter((item) => {
    if ('requiresAdmin' in item && item.requiresAdmin) {
      return isAuthenticated && user?.role === 'admin';
    }
    return true;
  });

  return (
    <nav className="bg-gradient-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-2xl font-bold">
              TechStore
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Cart and User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/carrito" className="text-white hover:text-gray-200 p-2 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {isHydrated && isAuthenticated && cartSummary.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartSummary.totalItems > 99 ? '99+' : cartSummary.totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated && user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className="hidden lg:block">{fullName}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-200 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-gray-200 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-3 space-x-2">
                  <Link 
                    href="/carrito" 
                    className="text-white hover:text-gray-200 p-2 relative"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    {isHydrated && isAuthenticated && cartSummary.totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartSummary.totalItems > 99 ? '99+' : cartSummary.totalItems}
                      </span>
                    )}
                  </Link>
                  {isAuthenticated && user ? (
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 bg-white/10 rounded-md px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{fullName}</p>
                          <p className="text-white/70 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/login" 
                      className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex-1 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
