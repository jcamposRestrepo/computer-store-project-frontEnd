'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { useCart } from '@/hooks/useCart';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loadCartFromServer } = useCart();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Por favor completa todos los campos');
      }

      if (!formData.email.includes('@')) {
        throw new Error('Por favor ingresa un email válido');
      }

      // Llamar al servicio de autenticación
      const response = await authService.login(formData.email, formData.password);

      if (response.success) {
        // Los datos ya se guardaron en localStorage por el servicio
        console.log('Login exitoso, cargando carrito del servidor...');
        
        // Cargar el carrito del servidor después del login
        await loadCartFromServer();
        
        // Verificar si hay una redirección guardada
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Redirigir a la página guardada o a la principal
        router.push(redirectUrl || '/');
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #27254C 0%, #564A94 50%, #1F232F 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite'
        }}
      ></div>
      
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float"
          style={{ 
            background: 'rgba(69, 176, 210, 0.1)',
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float"
          style={{ 
            background: 'rgba(86, 74, 148, 0.1)',
            animationDelay: '1s'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl animate-float"
          style={{ 
            background: 'rgba(155, 138, 180, 0.05)',
            animationDelay: '2s'
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 space-y-8 border border-white/20 animate-zoom-in hover-lift">
          <div className="text-center space-y-3 animate-fade-in-up">
            <div className="inline-block">
              <h2 
                className="text-4xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #27254C 0%, #564A94 50%, #45B0D2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Iniciar Sesión
              </h2>
              <div 
                className="h-1 w-20 mx-auto mt-2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #45B0D2 0%, #564A94 100%)'
                }}
              ></div>
            </div>
            <p className="text-[#9B8AB4] text-sm font-medium">
              Accede a tu cuenta de Web Computo
            </p>
          </div>
          
          <form 
            className="space-y-6 animate-fade-in-up" 
            style={{ animationDelay: '0.2s' }} 
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#27254C]">
                Email
              </label>
              <div className="relative">
                <div 
                  className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                    focusedField === 'email' ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background: 'linear-gradient(90deg, rgba(69, 176, 210, 0.2) 0%, rgba(86, 74, 148, 0.2) 100%)'
                  }}
                ></div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="relative w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#45B0D2] focus:border-transparent bg-[#F2ECF8]/50 border-[#9B8AB4]/30 text-[#27254C] placeholder:text-[#9B8AB4] focus:bg-white"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {focusedField === 'email' && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 animate-pulse-glow rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #45B0D2 0%, #564A94 100%)'
                    }}
                  ></div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#27254C]">
                Contraseña
              </label>
              <div className="relative">
                <div 
                  className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                    focusedField === 'password' ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background: 'linear-gradient(90deg, rgba(69, 176, 210, 0.2) 0%, rgba(86, 74, 148, 0.2) 100%)'
                  }}
                ></div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="relative w-full px-4 py-3 pr-12 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#45B0D2] focus:border-transparent bg-[#F2ECF8]/50 border-[#9B8AB4]/30 text-[#27254C] placeholder:text-[#9B8AB4] focus:bg-white"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9B8AB4] hover:text-[#564A94] focus:outline-none transition-colors duration-200 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {focusedField === 'password' && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 animate-pulse-glow rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #45B0D2 0%, #564A94 100%)'
                    }}
                  ></div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-fade-in-up">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#9B8AB4] text-[#564A94] focus:ring-2 focus:ring-[#45B0D2] cursor-pointer transition-all"
                  disabled={isLoading}
                />
                <span className="text-sm text-[#27254C] group-hover:text-[#564A94] transition-colors">
                  Recordarme
                </span>
              </label>

              <a 
                href="#" 
                className="text-sm font-medium text-[#564A94] hover:text-[#45B0D2] transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 text-white font-semibold rounded-lg transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#45B0D2] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #27254C 0%, #564A94 50%, #27254C 100%)',
                backgroundSize: '200% 200%',
                backgroundPosition: '0% 50%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundPosition = '100% 50%';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundPosition = '0% 50%';
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg 
                    className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <span className="text-sm text-[#9B8AB4]">
                ¿No tienes cuenta?{' '}
                <Link 
                  href="/register" 
                  className="font-medium text-[#564A94] hover:text-[#45B0D2] transition-colors duration-200 hover:underline"
                >
                  Regístrate aquí
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

