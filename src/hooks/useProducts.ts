'use client';

import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  badge?: string;
  description?: string;
  specifications?: Record<string, string>;
  type: 'componente' | 'computadora';
  createdAt: string;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item);
        // Si el localStorage tiene menos productos que los datos por defecto, usar los datos por defecto
        if (Array.isArray(parsedItem) && Array.isArray(initialValue) && parsedItem.length < initialValue.length) {
          console.log('Usando datos por defecto - localStorage tiene menos productos');
          setStoredValue(initialValue);
          window.localStorage.setItem(key, JSON.stringify(initialValue));
        } else {
          setStoredValue(parsedItem);
        }
      } else {
        // Si no hay datos en localStorage, usar los datos por defecto
        console.log('No hay datos en localStorage, usando datos por defecto');
        setStoredValue(initialValue);
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    } finally {
      setIsHydrated(true);
    }
  }, [key, initialValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isHydrated] as const;
}

// Productos de ejemplo por defecto - Catálogo completo
const defaultProducts: Product[] = [
  // Componentes
  {
    id: '1',
    name: 'Intel Core i7-13700K',
    price: 450000,
    originalPrice: 520000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Procesadores',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    badge: 'Nuevo',
    description: 'Procesador Intel Core i7 de 13ª generación con 16 núcleos y 24 hilos. Ideal para gaming y trabajo profesional.',
    specifications: {
      'Núcleos': '16 (8P + 8E)',
      'Hilos': '24',
      'Frecuencia Base': '3.4 GHz',
      'Frecuencia Turbo': '5.4 GHz',
      'Cache': '30 MB',
      'TDP': '125W',
      'Socket': 'LGA 1700'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
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
    inStock: true,
    badge: 'Popular',
    description: 'Tarjeta gráfica NVIDIA RTX 4070 Ti con arquitectura Ada Lovelace. Perfecta para gaming en 1440p y 4K.',
    specifications: {
      'GPU': 'RTX 4070 Ti',
      'VRAM': '12GB GDDR6X',
      'Bus': '192-bit',
      'CUDA Cores': '7680',
      'RT Cores': '60',
      'Tensor Cores': '240',
      'Consumo': '285W'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Corsair Vengeance LPX 32GB DDR4',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Memoria RAM',
    rating: 4.7,
    reviews: 203,
    inStock: true,
    description: 'Kit de memoria RAM DDR4 de 32GB (2x16GB) con velocidad de 3200MHz. Bajo perfil para compatibilidad.',
    specifications: {
      'Capacidad': '32GB (2x16GB)',
      'Velocidad': '3200MHz',
      'Latencia': 'CL16',
      'Voltaje': '1.35V',
      'Formato': 'DDR4 DIMM',
      'Perfil': 'Bajo (31mm)'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Samsung 980 PRO 1TB NVMe SSD',
    price: 320000,
    originalPrice: 380000,
    image: 'https://images.unsplash.com/photo-1597872200964-2b65d56bd16b?w=400&h=400&fit=crop',
    category: 'Almacenamiento',
    rating: 4.9,
    reviews: 127,
    inStock: true,
    badge: 'Destacado',
    description: 'SSD NVMe PCIe 4.0 de 1TB con velocidades de lectura de hasta 7000MB/s. Ideal para gaming y aplicaciones profesionales.',
    specifications: {
      'Capacidad': '1TB',
      'Interfaz': 'PCIe 4.0 x4 NVMe',
      'Lectura': '7000 MB/s',
      'Escritura': '5000 MB/s',
      'IOPS': '1,000,000',
      'Garantía': '5 años'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'ASUS ROG Strix B650E-F Gaming',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Placas Base',
    rating: 4.6,
    reviews: 94,
    inStock: true,
    description: 'Placa base AMD B650E con socket AM5, soporte para DDR5 y PCIe 5.0. Diseñada para gaming y overclocking.',
    specifications: {
      'Socket': 'AM5',
      'Chipset': 'B650E',
      'Memoria': 'DDR5 hasta 128GB',
      'PCIe': 'PCIe 5.0 x16',
      'USB': 'USB 3.2 Gen 2x2',
      'Red': '2.5Gb Ethernet',
      'Audio': 'SupremeFX 7.1'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Corsair RM850x 850W 80+ Gold',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Fuentes de Poder',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    description: 'Fuente de poder modular de 850W con certificación 80+ Gold. Silenciosa y eficiente para sistemas de alto rendimiento.',
    specifications: {
      'Potencia': '850W',
      'Certificación': '80+ Gold',
      'Modular': 'Completamente modular',
      'Ventilador': '140mm ML',
      'Protecciones': 'OCP, OVP, SCP, OPP',
      'Garantía': '10 años'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Computadoras
  {
    id: '7',
    name: 'PC Gaming Pro RTX 4080',
    price: 2500000,
    originalPrice: 2800000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Gaming',
    rating: 4.9,
    reviews: 67,
    inStock: true,
    badge: 'Destacado',
    description: 'PC Gaming completa con RTX 4080, Intel i7-13700K y 32GB RAM. Lista para gaming en 4K y streaming.',
    specifications: {
      'Procesador': 'Intel Core i7-13700K',
      'GPU': 'NVIDIA RTX 4080 16GB',
      'RAM': '32GB DDR5 5600MHz',
      'Almacenamiento': '1TB NVMe SSD',
      'Fuente': '850W 80+ Gold',
      'Gabinete': 'Corsair 4000D Airflow'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'PC Workstation AMD Ryzen 9',
    price: 1800000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Workstation',
    rating: 4.7,
    reviews: 43,
    inStock: true,
    description: 'Workstation profesional con AMD Ryzen 9 7950X y RTX 4070. Ideal para diseño, renderizado y desarrollo.',
    specifications: {
      'Procesador': 'AMD Ryzen 9 7950X',
      'GPU': 'NVIDIA RTX 4070 12GB',
      'RAM': '64GB DDR5 5200MHz',
      'Almacenamiento': '2TB NVMe SSD',
      'Fuente': '750W 80+ Gold',
      'Gabinete': 'Fractal Design Define 7'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'PC Gaming Budget RTX 4060',
    price: 1200000,
    originalPrice: 1350000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Gaming',
    rating: 4.5,
    reviews: 89,
    inStock: true,
    badge: 'Oferta',
    description: 'PC Gaming económica con RTX 4060 y Ryzen 5. Perfecta para gaming en 1080p y 1440p.',
    specifications: {
      'Procesador': 'AMD Ryzen 5 7600X',
      'GPU': 'NVIDIA RTX 4060 8GB',
      'RAM': '16GB DDR5 4800MHz',
      'Almacenamiento': '500GB NVMe SSD',
      'Fuente': '650W 80+ Bronze',
      'Gabinete': 'Cooler Master MasterBox'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'PC Streaming RTX 4070',
    price: 1900000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Streaming',
    rating: 4.8,
    reviews: 52,
    inStock: true,
    description: 'PC optimizada para streaming con RTX 4070 y Intel i5-13600K. Incluye capturadora y micrófono profesional.',
    specifications: {
      'Procesador': 'Intel Core i5-13600K',
      'GPU': 'NVIDIA RTX 4070 12GB',
      'RAM': '32GB DDR5 5600MHz',
      'Almacenamiento': '1TB NVMe SSD',
      'Capturadora': 'Elgato HD60 S+',
      'Micrófono': 'Blue Yeti USB'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  // Más Componentes
  {
    id: '11',
    name: 'AMD Ryzen 7 7700X',
    price: 380000,
    originalPrice: 420000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Procesadores',
    rating: 4.7,
    reviews: 134,
    inStock: true,
    badge: 'Oferta',
    description: 'Procesador AMD Ryzen 7 de 4ª generación con 8 núcleos y 16 hilos. Excelente rendimiento gaming.',
    specifications: {
      'Núcleos': '8',
      'Hilos': '16',
      'Frecuencia Base': '4.5 GHz',
      'Frecuencia Turbo': '5.4 GHz',
      'Cache': '32 MB',
      'TDP': '105W',
      'Socket': 'AM5'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'AMD Radeon RX 7800 XT',
    price: 720000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Tarjetas Gráficas',
    rating: 4.6,
    reviews: 78,
    inStock: true,
    description: 'Tarjeta gráfica AMD Radeon RX 7800 XT con 16GB VRAM. Ideal para gaming en 1440p y 4K.',
    specifications: {
      'GPU': 'RX 7800 XT',
      'VRAM': '16GB GDDR6',
      'Bus': '256-bit',
      'Stream Processors': '3840',
      'Ray Accelerators': '60',
      'Consumo': '263W'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '13',
    name: 'G.Skill Trident Z5 64GB DDR5',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Memoria RAM',
    rating: 4.8,
    reviews: 45,
    inStock: true,
    badge: 'Premium',
    description: 'Kit de memoria RAM DDR5 de 64GB (2x32GB) con velocidad de 6000MHz. Para sistemas de alto rendimiento.',
    specifications: {
      'Capacidad': '64GB (2x32GB)',
      'Velocidad': '6000MHz',
      'Latencia': 'CL30',
      'Voltaje': '1.35V',
      'Formato': 'DDR5 DIMM',
      'Perfil': 'Alto (42mm)'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '14',
    name: 'Western Digital Black SN850X 2TB',
    price: 580000,
    originalPrice: 650000,
    image: 'https://images.unsplash.com/photo-1597872200964-2b65d56bd16b?w=400&h=400&fit=crop',
    category: 'Almacenamiento',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    badge: 'Destacado',
    description: 'SSD NVMe PCIe 4.0 de 2TB con velocidades de lectura de hasta 7300MB/s. Gaming y trabajo profesional.',
    specifications: {
      'Capacidad': '2TB',
      'Interfaz': 'PCIe 4.0 x4 NVMe',
      'Lectura': '7300 MB/s',
      'Escritura': '6300 MB/s',
      'IOPS': '1,200,000',
      'Garantía': '5 años'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '15',
    name: 'MSI MPG Z790 Carbon WiFi',
    price: 420000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Placas Base',
    rating: 4.7,
    reviews: 67,
    inStock: true,
    description: 'Placa base Intel Z790 con socket LGA 1700, soporte para DDR5 y PCIe 5.0. Diseñada para gaming.',
    specifications: {
      'Socket': 'LGA 1700',
      'Chipset': 'Z790',
      'Memoria': 'DDR5 hasta 128GB',
      'PCIe': 'PCIe 5.0 x16',
      'USB': 'USB 3.2 Gen 2x2',
      'Red': 'WiFi 6E + 2.5Gb Ethernet',
      'Audio': 'Realtek ALC4080'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '16',
    name: 'Seasonic Focus GX-1000 1000W',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Fuentes de Poder',
    rating: 4.8,
    reviews: 112,
    inStock: true,
    description: 'Fuente de poder modular de 1000W con certificación 80+ Gold. Para sistemas de máxima potencia.',
    specifications: {
      'Potencia': '1000W',
      'Certificación': '80+ Gold',
      'Modular': 'Completamente modular',
      'Ventilador': '135mm FDB',
      'Protecciones': 'OCP, OVP, SCP, OPP, UVP',
      'Garantía': '10 años'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '17',
    name: 'Noctua NH-D15 Chromax Black',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Refrigeración',
    rating: 4.9,
    reviews: 156,
    inStock: true,
    badge: 'Popular',
    description: 'Disipador de calor de aire de alta gama con doble ventilador. Silencioso y eficiente.',
    specifications: {
      'Tipo': 'Disipador de aire',
      'Ventiladores': '2x NF-A15 PWM',
      'Altura': '165mm',
      'TDP': '220W',
      'Ruido': '24.6 dB(A)',
      'Compatibilidad': 'Intel/AMD'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '18',
    name: 'Corsair iCUE H150i Elite Capellix',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Refrigeración',
    rating: 4.7,
    reviews: 98,
    inStock: true,
    description: 'Refrigeración líquida AIO de 360mm con ventiladores RGB. Control de temperatura avanzado.',
    specifications: {
      'Tipo': 'AIO Liquid Cooling',
      'Radiador': '360mm',
      'Ventiladores': '3x ML120 RGB',
      'Bomba': 'PWM controlada',
      'RGB': 'iCUE RGB',
      'Compatibilidad': 'Intel/AMD'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '19',
    name: 'Fractal Design Define 7',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Gabinetes',
    rating: 4.6,
    reviews: 73,
    inStock: true,
    description: 'Gabinete de torre media con diseño silencioso y excelente gestión de cables.',
    specifications: {
      'Formato': 'Mid Tower',
      'Material': 'Acero + aluminio',
      'Ventiladores': '2x Dynamic X2 GP-14',
      'Filtros': 'Filtros de polvo',
      'RGB': 'No',
      'Peso': '12.8 kg'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '20',
    name: 'Lian Li O11 Dynamic EVO',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Gabinetes',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    badge: 'Nuevo',
    description: 'Gabinete de cristal templado con excelente flujo de aire y soporte para radiadores grandes.',
    specifications: {
      'Formato': 'Mid Tower',
      'Material': 'Acero + cristal templado',
      'Ventiladores': 'No incluidos',
      'RGB': 'Soporte RGB',
      'Radiadores': 'Hasta 360mm',
      'Peso': '8.5 kg'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Más Componentes Adicionales
  {
    id: '26',
    name: 'Intel Core i5-13600K',
    price: 320000,
    originalPrice: 380000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Procesadores',
    rating: 4.6,
    reviews: 198,
    inStock: true,
    badge: 'Oferta',
    description: 'Procesador Intel Core i5 de 13ª generación con 14 núcleos y 20 hilos. Excelente relación precio-rendimiento.',
    specifications: {
      'Núcleos': '14 (6P + 8E)',
      'Hilos': '20',
      'Frecuencia Base': '3.5 GHz',
      'Frecuencia Turbo': '5.1 GHz',
      'Cache': '24 MB',
      'TDP': '125W',
      'Socket': 'LGA 1700'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '27',
    name: 'AMD Ryzen 5 7600X',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Procesadores',
    rating: 4.5,
    reviews: 167,
    inStock: true,
    description: 'Procesador AMD Ryzen 5 de 4ª generación con 6 núcleos y 12 hilos. Ideal para gaming y multitarea.',
    specifications: {
      'Núcleos': '6',
      'Hilos': '12',
      'Frecuencia Base': '4.7 GHz',
      'Frecuencia Turbo': '5.3 GHz',
      'Cache': '32 MB',
      'TDP': '105W',
      'Socket': 'AM5'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '28',
    name: 'NVIDIA RTX 4060 Ti 8GB',
    price: 650000,
    originalPrice: 720000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Tarjetas Gráficas',
    rating: 4.4,
    reviews: 145,
    inStock: true,
    badge: 'Popular',
    description: 'Tarjeta gráfica NVIDIA RTX 4060 Ti con 8GB VRAM. Perfecta para gaming en 1080p y 1440p.',
    specifications: {
      'GPU': 'RTX 4060 Ti',
      'VRAM': '8GB GDDR6',
      'Bus': '128-bit',
      'CUDA Cores': '4352',
      'RT Cores': '34',
      'Tensor Cores': '136',
      'Consumo': '165W'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '29',
    name: 'AMD Radeon RX 7600 XT',
    price: 580000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Tarjetas Gráficas',
    rating: 4.3,
    reviews: 89,
    inStock: true,
    description: 'Tarjeta gráfica AMD Radeon RX 7600 XT con 16GB VRAM. Ideal para gaming y streaming.',
    specifications: {
      'GPU': 'RX 7600 XT',
      'VRAM': '16GB GDDR6',
      'Bus': '128-bit',
      'Stream Processors': '2048',
      'Ray Accelerators': '32',
      'Consumo': '190W'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '30',
    name: 'Kingston Fury Beast 16GB DDR5',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Memoria RAM',
    rating: 4.4,
    reviews: 234,
    inStock: true,
    description: 'Kit de memoria RAM DDR5 de 16GB (2x8GB) con velocidad de 4800MHz. Diseño agresivo para gaming.',
    specifications: {
      'Capacidad': '16GB (2x8GB)',
      'Velocidad': '4800MHz',
      'Latencia': 'CL38',
      'Voltaje': '1.1V',
      'Formato': 'DDR5 DIMM',
      'Perfil': 'Alto (34mm)'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Más Componentes - Procesadores
  {
    id: '31',
    name: 'Intel Core i9-13900K',
    price: 650000,
    originalPrice: 750000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Procesadores',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    badge: 'Premium',
    description: 'Procesador Intel Core i9 de 13ª generación con 24 núcleos y 32 hilos. Máximo rendimiento.',
    specifications: {
      'Núcleos': '24 (8P + 16E)',
      'Hilos': '32',
      'Frecuencia Base': '3.0 GHz',
      'Frecuencia Turbo': '5.8 GHz',
      'Cache': '36 MB',
      'TDP': '125W',
      'Socket': 'LGA 1700'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '32',
    name: 'AMD Ryzen 9 7950X',
    price: 580000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Procesadores',
    rating: 4.8,
    reviews: 76,
    inStock: true,
    badge: 'Destacado',
    description: 'Procesador AMD Ryzen 9 de 4ª generación con 16 núcleos y 32 hilos. Para profesionales.',
    specifications: {
      'Núcleos': '16',
      'Hilos': '32',
      'Frecuencia Base': '4.5 GHz',
      'Frecuencia Turbo': '5.7 GHz',
      'Cache': '64 MB',
      'TDP': '170W',
      'Socket': 'AM5'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Más Tarjetas Gráficas
  {
    id: '33',
    name: 'NVIDIA RTX 4090 24GB',
    price: 1800000,
    originalPrice: 2000000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Tarjetas Gráficas',
    rating: 4.9,
    reviews: 45,
    inStock: true,
    badge: 'Premium',
    description: 'Tarjeta gráfica NVIDIA RTX 4090 con 24GB VRAM. La más potente del mercado.',
    specifications: {
      'GPU': 'RTX 4090',
      'VRAM': '24GB GDDR6X',
      'Bus': '384-bit',
      'CUDA Cores': '16384',
      'RT Cores': '128',
      'Tensor Cores': '512',
      'Consumo': '450W'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '34',
    name: 'AMD Radeon RX 7900 XTX',
    price: 1200000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Tarjetas Gráficas',
    rating: 4.7,
    reviews: 67,
    inStock: true,
    description: 'Tarjeta gráfica AMD Radeon RX 7900 XTX con 24GB VRAM. Competencia directa a RTX 4080.',
    specifications: {
      'GPU': 'RX 7900 XTX',
      'VRAM': '24GB GDDR6',
      'Bus': '384-bit',
      'Stream Processors': '6144',
      'Ray Accelerators': '96',
      'Consumo': '355W'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Más Memoria RAM
  {
    id: '35',
    name: 'Corsair Dominator Platinum 32GB DDR5',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Memoria RAM',
    rating: 4.8,
    reviews: 123,
    inStock: true,
    badge: 'Premium',
    description: 'Kit de memoria RAM DDR5 de 32GB (2x16GB) con velocidad de 5600MHz. Máxima calidad.',
    specifications: {
      'Capacidad': '32GB (2x16GB)',
      'Velocidad': '5600MHz',
      'Latencia': 'CL36',
      'Voltaje': '1.25V',
      'Formato': 'DDR5 DIMM',
      'Perfil': 'Alto (40mm)'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '36',
    name: 'TeamGroup T-Force Delta RGB 16GB DDR4',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Memoria RAM',
    rating: 4.3,
    reviews: 189,
    inStock: true,
    badge: 'RGB',
    description: 'Kit de memoria RAM DDR4 de 16GB (2x8GB) con RGB y velocidad de 3200MHz.',
    specifications: {
      'Capacidad': '16GB (2x8GB)',
      'Velocidad': '3200MHz',
      'Latencia': 'CL16',
      'Voltaje': '1.35V',
      'Formato': 'DDR4 DIMM',
      'RGB': 'Sí'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Más Almacenamiento
  {
    id: '37',
    name: 'Crucial P5 Plus 2TB NVMe SSD',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1597872200964-2b65d56bd16b?w=400&h=400&fit=crop',
    category: 'Almacenamiento',
    rating: 4.6,
    reviews: 156,
    inStock: true,
    description: 'SSD NVMe PCIe 4.0 de 2TB con velocidades de lectura de hasta 6600MB/s.',
    specifications: {
      'Capacidad': '2TB',
      'Interfaz': 'PCIe 4.0 x4 NVMe',
      'Lectura': '6600 MB/s',
      'Escritura': '5000 MB/s',
      'IOPS': '900,000',
      'Garantía': '5 años'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '38',
    name: 'Seagate Barracuda 4TB HDD',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1597872200964-2b65d56bd16b?w=400&h=400&fit=crop',
    category: 'Almacenamiento',
    rating: 4.2,
    reviews: 234,
    inStock: true,
    description: 'Disco duro de 4TB con velocidad de 7200 RPM. Ideal para almacenamiento masivo.',
    specifications: {
      'Capacidad': '4TB',
      'Interfaz': 'SATA 6Gb/s',
      'Velocidad': '7200 RPM',
      'Cache': '256MB',
      'Formato': '3.5"',
      'Garantía': '2 años'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Más Placas Base
  {
    id: '39',
    name: 'Gigabyte X670E Aorus Master',
    price: 520000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Placas Base',
    rating: 4.7,
    reviews: 89,
    inStock: true,
    badge: 'Premium',
    description: 'Placa base AMD X670E con socket AM5, soporte para DDR5 y PCIe 5.0. Máxima calidad.',
    specifications: {
      'Socket': 'AM5',
      'Chipset': 'X670E',
      'Memoria': 'DDR5 hasta 128GB',
      'PCIe': 'PCIe 5.0 x16',
      'USB': 'USB 3.2 Gen 2x2',
      'Red': 'WiFi 6E + 10Gb Ethernet',
      'Audio': 'Realtek ALC1220'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  {
    id: '40',
    name: 'ASRock B550M Pro4',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Placas Base',
    rating: 4.4,
    reviews: 167,
    inStock: true,
    description: 'Placa base AMD B550 con socket AM4, soporte para DDR4. Excelente relación precio-calidad.',
    specifications: {
      'Socket': 'AM4',
      'Chipset': 'B550',
      'Memoria': 'DDR4 hasta 128GB',
      'PCIe': 'PCIe 4.0 x16',
      'USB': 'USB 3.2 Gen 1',
      'Red': 'Gigabit Ethernet',
      'Audio': 'Realtek ALC897'
    },
    type: 'componente',
    createdAt: new Date().toISOString(),
  },
  // Más Computadoras
  {
    id: '21',
    name: 'PC Gaming Extreme RTX 4090',
    price: 4200000,
    originalPrice: 4800000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Gaming',
    rating: 4.9,
    reviews: 34,
    inStock: true,
    badge: 'Premium',
    description: 'PC Gaming de máxima gama con RTX 4090, Intel i9-13900K y 64GB RAM. Rendimiento extremo.',
    specifications: {
      'Procesador': 'Intel Core i9-13900K',
      'GPU': 'NVIDIA RTX 4090 24GB',
      'RAM': '64GB DDR5 6000MHz',
      'Almacenamiento': '2TB NVMe SSD',
      'Fuente': '1000W 80+ Gold',
      'Gabinete': 'Lian Li O11 Dynamic EVO'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '22',
    name: 'PC Office Intel i5',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Oficina',
    rating: 4.4,
    reviews: 67,
    inStock: true,
    description: 'PC de oficina con Intel i5-13400 y gráficos integrados. Ideal para trabajo y productividad.',
    specifications: {
      'Procesador': 'Intel Core i5-13400',
      'GPU': 'Intel UHD Graphics 730',
      'RAM': '16GB DDR4 3200MHz',
      'Almacenamiento': '512GB NVMe SSD',
      'Fuente': '450W 80+ Bronze',
      'Gabinete': 'Fractal Design Core 1000'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '23',
    name: 'PC Content Creator RTX 4070',
    price: 2100000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Content Creation',
    rating: 4.7,
    reviews: 45,
    inStock: true,
    badge: 'Especializado',
    description: 'PC especializada para creación de contenido con RTX 4070 y AMD Ryzen 7. Incluye software profesional.',
    specifications: {
      'Procesador': 'AMD Ryzen 7 7700X',
      'GPU': 'NVIDIA RTX 4070 12GB',
      'RAM': '32GB DDR5 5600MHz',
      'Almacenamiento': '1TB NVMe SSD + 2TB HDD',
      'Fuente': '750W 80+ Gold',
      'Software': 'Adobe Creative Suite'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '24',
    name: 'PC Mini ITX Gaming',
    price: 1600000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Gaming',
    rating: 4.5,
    reviews: 28,
    inStock: true,
    description: 'PC Gaming compacta en formato Mini ITX con RTX 4060 Ti. Perfecta para espacios reducidos.',
    specifications: {
      'Procesador': 'AMD Ryzen 5 7600X',
      'GPU': 'NVIDIA RTX 4060 Ti 8GB',
      'RAM': '32GB DDR5 4800MHz',
      'Almacenamiento': '1TB NVMe SSD',
      'Fuente': '650W 80+ Gold SFX',
      'Gabinete': 'Cooler Master NR200P'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '25',
    name: 'PC Workstation Dual GPU',
    price: 3500000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Workstation',
    rating: 4.8,
    reviews: 19,
    inStock: true,
    badge: 'Profesional',
    description: 'Workstation profesional con doble GPU RTX 4080 y AMD Ryzen 9. Para renderizado y simulación.',
    specifications: {
      'Procesador': 'AMD Ryzen 9 7950X',
      'GPU': '2x NVIDIA RTX 4080 16GB',
      'RAM': '128GB DDR5 5200MHz',
      'Almacenamiento': '4TB NVMe SSD',
      'Fuente': '1200W 80+ Platinum',
      'Gabinete': 'Fractal Design Define 7 XL'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  // Más Computadoras Adicionales
  {
    id: '41',
    name: 'PC Gaming RTX 4070 Super',
    price: 2200000,
    originalPrice: 2400000,
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    category: 'Gaming',
    rating: 4.7,
    reviews: 78,
    inStock: true,
    badge: 'Nuevo',
    description: 'PC Gaming con RTX 4070 Super y Intel i5-14600K. Rendimiento excelente para gaming en 1440p.',
    specifications: {
      'Procesador': 'Intel Core i5-14600K',
      'GPU': 'NVIDIA RTX 4070 Super 12GB',
      'RAM': '32GB DDR5 5600MHz',
      'Almacenamiento': '1TB NVMe SSD',
      'Fuente': '750W 80+ Gold',
      'Gabinete': 'Corsair 4000D Airflow'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '42',
    name: 'PC Office AMD Ryzen 5',
    price: 750000,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop',
    category: 'Oficina',
    rating: 4.3,
    reviews: 145,
    inStock: true,
    description: 'PC de oficina con AMD Ryzen 5 5600G y gráficos integrados. Ideal para trabajo y productividad.',
    specifications: {
      'Procesador': 'AMD Ryzen 5 5600G',
      'GPU': 'AMD Radeon Graphics integrada',
      'RAM': '16GB DDR4 3200MHz',
      'Almacenamiento': '512GB NVMe SSD',
      'Fuente': '450W 80+ Bronze',
      'Gabinete': 'Fractal Design Core 1000'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '43',
    name: 'PC Streaming RTX 4060 Ti',
    price: 1500000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Streaming',
    rating: 4.5,
    reviews: 67,
    inStock: true,
    badge: 'Streaming',
    description: 'PC optimizada para streaming con RTX 4060 Ti y AMD Ryzen 7. Incluye capturadora.',
    specifications: {
      'Procesador': 'AMD Ryzen 7 7700X',
      'GPU': 'NVIDIA RTX 4060 Ti 8GB',
      'RAM': '32GB DDR5 5600MHz',
      'Almacenamiento': '1TB NVMe SSD',
      'Capturadora': 'Elgato HD60 S+',
      'Micrófono': 'Blue Yeti USB'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '44',
    name: 'PC Content Creator RTX 4080',
    price: 2800000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'Content Creation',
    rating: 4.8,
    reviews: 34,
    inStock: true,
    badge: 'Profesional',
    description: 'PC especializada para creación de contenido con RTX 4080 y Intel i7. Incluye software profesional.',
    specifications: {
      'Procesador': 'Intel Core i7-13700K',
      'GPU': 'NVIDIA RTX 4080 16GB',
      'RAM': '64GB DDR5 5600MHz',
      'Almacenamiento': '2TB NVMe SSD + 4TB HDD',
      'Fuente': '850W 80+ Gold',
      'Software': 'Adobe Creative Suite'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
  {
    id: '45',
    name: 'PC Gaming Budget RX 7600',
    price: 950000,
    originalPrice: 1100000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop',
    category: 'Gaming',
    rating: 4.4,
    reviews: 123,
    inStock: true,
    badge: 'Oferta',
    description: 'PC Gaming económica con RX 7600 y AMD Ryzen 5. Perfecta para gaming en 1080p.',
    specifications: {
      'Procesador': 'AMD Ryzen 5 7600X',
      'GPU': 'AMD Radeon RX 7600 8GB',
      'RAM': '16GB DDR5 4800MHz',
      'Almacenamiento': '500GB NVMe SSD',
      'Fuente': '650W 80+ Bronze',
      'Gabinete': 'Cooler Master MasterBox'
    },
    type: 'computadora',
    createdAt: new Date().toISOString(),
  },
];

export function useProducts() {
  const [products, setProducts, isHydrated] = useLocalStorage<Product[]>('techstore-products', defaultProducts);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updates } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const resetToDefault = () => {
    console.log('Reseteando a datos por defecto');
    setProducts(defaultProducts);
  };

  const getProductsByType = (type: 'componente' | 'computadora') => {
    return products.filter(product => product.type === type);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category.toLowerCase().includes(category.toLowerCase()));
  };

  // Función global para debug
  if (typeof window !== 'undefined') {
    (window as any).resetTechStoreData = () => {
      console.log('Limpiando localStorage y cargando datos por defecto...');
      localStorage.removeItem('techstore-products');
      window.location.reload();
    };
  }

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefault,
    getProductsByType,
    getProductsByCategory,
    isHydrated,
  };
}
