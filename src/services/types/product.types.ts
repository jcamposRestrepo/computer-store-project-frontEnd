// Tipos para la respuesta del API de productos

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  image?: string | null;
  isActive?: boolean;
  createdAt?: string | FirestoreTimestamp;
  updatedAt?: string | FirestoreTimestamp;
}

export interface ProductImage {
  id?: number;
  url: string;
  alt?: string;
}

export interface ProductSpecifications {
  [key: string]: string;
}

// Tipo para fechas de Firestore
export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface ApiProduct {
  id: number | string;
  name: string;
  description: string;
  shortDescription: string | null;
  price: number;
  comparePrice: number;
  sku: string;
  stock: number;
  minStock: number;
  weight: number | string | null;
  dimensions: string | null;
  brand: string | null;
  model: string | null;
  warranty: string | null;
  images: string[]; // Array de rutas relativas como "/uploads/products/image.jpg"
  specifications: ProductSpecifications | string[]; // Puede ser objeto o array de strings
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
  categoryId: number | string;
  tags: string[];
  productType?: 'componente' | 'computadora'; // Opcional porque puede no venir en la respuesta
  badge: string | null;
  inStock?: boolean; // Opcional, puede inferirse de stock
  createdAt: string | FirestoreTimestamp;
  updatedAt: string | FirestoreTimestamp;
  category: Category | null;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: ApiProduct[];
    pagination: Pagination;
  };
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

