'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import { createProduct, updateProduct as updateProductAPI, getCategoryIdByName, getCategories, createCategory, CreateProductData, UpdateProductData, Category, CreateCategoryData } from '@/services';
import { createPortal } from 'react-dom';

interface ProductUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editingProduct?: Product | null;
  hideTitle?: boolean;
}

export default function ProductUploadForm({ onSuccess, onCancel, editingProduct, hideTitle = false }: ProductUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalClosing, setCategoryModalClosing] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const initialImageUrls = editingProduct?.image ? [editingProduct.image] : [''];
  // Detectar si la imagen es base64 (data URL) o URL normal
  const initialImageTypes = initialImageUrls.map(url => 
    url && url.startsWith('data:') ? 'file' : 'url'
  ) as ('url' | 'file')[];
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price?.toString() || '',
    comparePrice: (editingProduct as any)?.comparePrice?.toString() || (editingProduct?.originalPrice?.toString() || ''),
    shortDescription: '',
    image: editingProduct?.image || '',
    imageUrls: initialImageUrls,
    imageFiles: new Array(initialImageUrls.length).fill(null) as (File | null)[], // Archivos subidos
    imageTypes: initialImageTypes, // Tipo de cada imagen (detectado automáticamente)
    category: editingProduct?.category || '',
    description: editingProduct?.description || '',
    type: editingProduct?.type || 'componente' as 'componente' | 'computadora',
    inStock: editingProduct?.inStock ?? true,
    stock: (editingProduct as any)?.stock?.toString() || '0',
    minStock: (editingProduct as any)?.minStock?.toString() || '0',
    badge: editingProduct?.badge || '',
    brand: '',
    model: '',
    sku: '',
    warranty: '',
    weight: '',
    dimensions: '',
    specifications: editingProduct?.specifications 
      ? Object.entries(editingProduct.specifications).map(([key, value]) => `${key}: ${value}`).join('\n')
      : '',
    tags: ((editingProduct as any)?.tags as string[] | undefined)?.join(', ') || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar categorías desde el API
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setSubmitError('Error al cargar las categorías. Por favor, recarga la página.');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Crear object URLs para los archivos seleccionados
  const imagePreviewUrls = useMemo(() => {
    return formData.imageFiles.map(file => file ? URL.createObjectURL(file) : null);
  }, [formData.imageFiles]);

  // Limpiar object URLs cuando cambien los archivos o cuando el componente se desmonte
  useEffect(() => {
    const currentUrls = imagePreviewUrls;
    return () => {
      currentUrls.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviewUrls]);

  // Función para cerrar el modal de categoría con animación
  const handleCloseCategoryModal = () => {
    setCategoryModalClosing(true);
    setTimeout(() => {
      setShowCategoryModal(false);
      setCategoryModalClosing(false);
      setCategoryFormData({ name: '', description: '', isActive: true });
      setCategoryFormError(null);
    }, 300);
  };

  // Función para manejar el submit del formulario de categoría
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormLoading(true);
    setCategoryFormError(null);

    try {
      if (!categoryFormData.name.trim()) {
        throw new Error('El nombre de la categoría es requerido');
      }

      const categoryData: CreateCategoryData = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim() || undefined,
        isActive: categoryFormData.isActive,
      };

      console.log('Intentando crear categoría con datos:', categoryData);
      const createdCategory = await createCategory(categoryData);
      console.log('Categoría creada exitosamente:', createdCategory);
      
      // Recargar categorías
      await loadCategories();
      
      // Seleccionar la categoría recién creada
      setFormData(prev => ({ ...prev, category: categoryFormData.name.trim() }));
      
      // Cerrar modal
      handleCloseCategoryModal();
    } catch (error) {
      console.error('Error al crear categoría:', error);
      let errorMessage = 'Error al crear la categoría. Por favor intenta de nuevo.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Mensajes más específicos para errores comunes
        if (error.message.includes('Failed to fetch') || error.message.includes('No se pudo conectar')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica que el servidor esté corriendo y que no haya problemas de red.';
        } else if (error.message.includes('token')) {
          errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
        }
      }
      
      setCategoryFormError(errorMessage);
    } finally {
      setCategoryFormLoading(false);
    }
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCategoryModal) {
        handleCloseCategoryModal();
      }
    };

    if (showCategoryModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCategoryModal]);

  const handleCategoryBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseCategoryModal();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.comparePrice && parseFloat(formData.comparePrice) <= parseFloat(formData.price)) {
      newErrors.comparePrice = 'El precio de comparación debe ser mayor al precio actual';
    }

    const hasImages = formData.imageUrls.some(url => url.trim()) || formData.imageFiles.length > 0;
    if (!hasImages) {
      newErrors.image = 'Debe proporcionar al menos una imagen';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    try {
      // Parsear especificaciones
      const specifications: Record<string, string> = {};
      if (formData.specifications.trim()) {
        formData.specifications.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            specifications[key] = value;
          }
        });
      }

      // Obtener categoryId desde el API
      console.log('Buscando categoría:', formData.category);
      const categoryId = await getCategoryIdByName(formData.category);
      console.log('CategoryId encontrado:', categoryId);
      
      if (!categoryId) {
        throw new Error(`No se encontró la categoría "${formData.category}". Por favor verifica que la categoría exista.`);
      }

      // Parsear tags
      const tags = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      // Procesar imágenes: URLs y archivos
      const imageUrls: string[] = [];
      
      // Agregar URLs válidas
      formData.imageUrls.forEach((url, index) => {
        if (formData.imageTypes[index] === 'url' && url.trim()) {
          imageUrls.push(url.trim());
        }
      });

      // Convertir archivos a base64 data URLs
      for (let i = 0; i < formData.imageFiles.length; i++) {
        const file = formData.imageFiles[i];
        
        if (file && formData.imageTypes[i] === 'file') {
          // Convertir a base64 data URL
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          try {
            const dataUrl = await base64Promise;
            imageUrls.push(dataUrl);
          } catch (error) {
            console.error('Error al convertir archivo a base64:', error);
            throw new Error(`Error al procesar la imagen ${i + 1}`);
          }
        }
      }

      // Preparar datos del producto
      const productData: CreateProductData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId,
        productType: formData.type,
        inStock: formData.inStock,
      };

      // Campos opcionales
      if (formData.shortDescription.trim()) {
        productData.shortDescription = formData.shortDescription.trim();
      }
      if (formData.comparePrice && formData.comparePrice.trim()) {
        const comparePrice = parseFloat(formData.comparePrice);
        if (comparePrice > 0) {
          productData.comparePrice = comparePrice;
        }
      }
      if (formData.stock && formData.stock.trim()) {
        productData.stock = parseInt(formData.stock);
      }
      if (formData.minStock && formData.minStock.trim()) {
        productData.minStock = parseInt(formData.minStock);
      }
      if (formData.badge.trim()) {
        productData.badge = formData.badge.trim();
      }
      if (formData.brand.trim()) {
        productData.brand = formData.brand.trim();
      }
      if (formData.model.trim()) {
        productData.model = formData.model.trim();
      }
      if (formData.sku.trim()) {
        productData.sku = formData.sku.trim();
      }
      if (formData.warranty.trim()) {
        productData.warranty = formData.warranty.trim();
      }
      if (formData.weight && formData.weight.trim()) {
        productData.weight = parseFloat(formData.weight);
      }
      if (formData.dimensions.trim()) {
        productData.dimensions = formData.dimensions.trim();
      }
      if (imageUrls.length > 0) {
        productData.images = imageUrls;
      }
      if (Object.keys(specifications).length > 0) {
        productData.specifications = specifications;
      }
      if (tags.length > 0) {
        productData.tags = tags;
      }

      if (editingProduct) {
        // Actualizar producto existente
        console.log('Actualizando producto:', editingProduct.id);
        const updateData: UpdateProductData = {
          id: editingProduct.id,
          ...productData,
        };
        console.log('Datos a actualizar:', updateData);
        await updateProductAPI(updateData);
        console.log('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        console.log('Creando nuevo producto:', productData);
        await createProduct(productData);
        console.log('Producto creado exitosamente');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setSubmitError(error instanceof Error ? error.message : 'Error al guardar el producto. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  return (
    <div className={`max-w-2xl mx-auto ${hideTitle ? 'p-6' : 'p-6'} ${hideTitle ? '' : 'bg-white rounded-lg shadow-custom'}`}>
      {!hideTitle && (
        <h2 className="text-2xl font-bold text-primary mb-6">
          {editingProduct ? 'Editar' : 'Subir'} {formData.type === 'componente' ? 'Componente' : 'Computadora'}
        </h2>
      )}

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Producto *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="componente"
                checked={formData.type === 'componente'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="mr-2"
              />
              Componente
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="computadora"
                checked={formData.type === 'computadora'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="mr-2"
              />
              Computadora
            </label>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Intel Core i7-13700K"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Precio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Precio Actual *
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="450000"
              min="0"
              step="1000"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="comparePrice" className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Comparación (Opcional)
            </label>
            <input
              type="number"
              id="comparePrice"
              value={formData.comparePrice}
              onChange={(e) => handleInputChange('comparePrice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.comparePrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="520000"
              min="0"
              step="1000"
            />
            {errors.comparePrice && <p className="text-red-500 text-sm mt-1">{errors.comparePrice}</p>}
          </div>
        </div>

        {/* Descripción corta */}
        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Corta (Opcional)
          </label>
          <input
            type="text"
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Breve descripción del producto"
          />
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <div className="flex gap-2">
            {loadingCategories ? (
              <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span className="text-sm text-gray-500">Cargando categorías...</span>
              </div>
            ) : (
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories
                  .filter(cat => cat.isActive !== false) // Filtrar solo categorías activas
                  .map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => {
                setShowCategoryModal(true);
                setCategoryModalClosing(false);
              }}
              className="px-3 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors duration-200 flex items-center justify-center"
              title="Agregar nueva categoría"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes *
          </label>
          {formData.imageUrls.map((url, index) => {
            const imageType = formData.imageTypes[index] || 'url';
            const imageFile = formData.imageFiles[index];
            // Determinar la URL de preview
            let previewUrl: string | null = null;
            if (imageType === 'file') {
              // Si hay un archivo seleccionado, usar su preview del useMemo
              if (imageFile && imagePreviewUrls[index]) {
                previewUrl = imagePreviewUrls[index];
              } else if (url && url.trim() && url.startsWith('data:')) {
                // Si no hay archivo pero hay una imagen base64 existente, mostrarla
                previewUrl = url.trim();
              }
            } else {
              // Si es URL, mostrar la URL si existe
              previewUrl = url.trim() || null;
            }

            return (
              <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`imageType-${index}`}
                      checked={imageType === 'url'}
                      onChange={() => {
                        const newTypes = [...formData.imageTypes];
                        newTypes[index] = 'url';
                        setFormData(prev => ({ ...prev, imageTypes: newTypes }));
                      }}
                      className="mr-1"
                    />
                    URL
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`imageType-${index}`}
                      checked={imageType === 'file'}
                      onChange={() => {
                        const newTypes = [...formData.imageTypes];
                        newTypes[index] = 'file';
                        setFormData(prev => ({ ...prev, imageTypes: newTypes }));
                      }}
                      className="mr-1"
                    />
                    Archivo
                  </label>
                  {formData.imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = formData.imageUrls.filter((_, i) => i !== index);
                        const newFiles = formData.imageFiles.filter((_, i) => i !== index);
                        const newTypes = formData.imageTypes.filter((_, i) => i !== index);
                        setFormData(prev => ({ 
                          ...prev, 
                          imageUrls: newUrls,
                          imageFiles: newFiles,
                          imageTypes: newTypes
                        }));
                      }}
                      className="ml-auto px-3 py-1 text-red-500 hover:text-red-700 border border-red-300 rounded-md text-sm"
                    >
                      ✕ Eliminar
                    </button>
                  )}
                </div>

                {imageType === 'url' ? (
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...formData.imageUrls];
                      newUrls[index] = e.target.value;
                      setFormData(prev => ({ ...prev, imageUrls: newUrls }));
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const newFiles = [...formData.imageFiles];
                        newFiles[index] = file;
                        setFormData(prev => ({ ...prev, imageFiles: newFiles }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}

                {previewUrl && (
                  <div className="mt-2 w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                imageUrls: [...prev.imageUrls, ''],
                imageFiles: [...prev.imageFiles, null],
                imageTypes: [...prev.imageTypes, 'url']
              }));
            }}
            className="mt-2 px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
          >
            + Agregar otra imagen
          </button>
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe las características principales del producto..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Especificaciones */}
        <div>
          <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">
            Especificaciones (Opcional)
          </label>
          <textarea
            id="specifications"
            value={formData.specifications}
            onChange={(e) => handleInputChange('specifications', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Frecuencia: 3.4 GHz&#10;Núcleos: 8&#10;Hilos: 16"
          />
          <p className="text-sm text-gray-500 mt-1">
            Formato: Clave: Valor (una por línea)
          </p>
        </div>

        {/* Stock y Badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock (Opcional)
            </label>
            <input
              type="number"
              id="stock"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="10"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo (Opcional)
            </label>
            <input
              type="number"
              id="minStock"
              value={formData.minStock}
              onChange={(e) => handleInputChange('minStock', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="5"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-2">
              Badge (Opcional)
            </label>
            <select
              id="badge"
              value={formData.badge}
              onChange={(e) => handleInputChange('badge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sin badge</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Popular">Popular</option>
              <option value="Destacado">Destacado</option>
              <option value="Premium">Premium</option>
              <option value="Oferta">Oferta</option>
            </select>
          </div>
        </div>

        {/* En Stock */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="inStock"
            checked={formData.inStock}
            onChange={(e) => handleInputChange('inStock', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
            En Stock
          </label>
        </div>

        {/* Brand, Model, SKU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
              Marca (Opcional)
            </label>
            <input
              type="text"
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Intel"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Modelo (Opcional)
            </label>
            <input
              type="text"
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="i7-13700K"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU (Opcional)
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="INT-I7-13700K"
            />
          </div>
        </div>

        {/* Warranty, Weight, Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="warranty" className="block text-sm font-medium text-gray-700 mb-2">
              Garantía (Opcional)
            </label>
            <input
              type="text"
              id="warranty"
              value={formData.warranty}
              onChange={(e) => handleInputChange('warranty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="3 años"
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Peso (Opcional)
            </label>
            <input
              type="number"
              id="weight"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.05"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-2">
              Dimensiones (Opcional)
            </label>
            <input
              type="text"
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => handleInputChange('dimensions', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="37.5 x 45.0 mm"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Opcional)
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="procesador, intel, gaming, rendimiento"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separa los tags con comas
          </p>
        </div>

        {/* Botones */}
        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-primary text-white py-3 px-6 rounded-md font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {editingProduct ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              editingProduct ? 'Actualizar Producto' : 'Subir Producto'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Modal para crear nueva categoría */}
      {showCategoryModal && typeof window !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            categoryModalClosing 
              ? 'opacity-0 pointer-events-none' 
              : 'opacity-100'
          }`}
          onClick={handleCategoryBackdropClick}
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        >
          {/* Backdrop con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
          
          {/* Modal Content */}
          <div 
            className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out ${
              categoryModalClosing 
                ? 'scale-95 translate-y-4 opacity-0' 
                : 'scale-100 translate-y-0 opacity-100'
            }`}
          >
            {/* Header con gradiente y botón de cerrar */}
            <div className="bg-gradient-primary text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold">
                Nueva Categoría
              </h2>
              <button
                onClick={handleCloseCategoryModal}
                className="text-white hover:text-gray-200 transition-all duration-200 transform hover:scale-110 hover:rotate-90 p-2 rounded-full hover:bg-white/20"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {categoryFormError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{categoryFormError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ej: Procesadores"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    id="categoryDescription"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Descripción de la categoría..."
                  />
                </div>

                {/* Activa */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="categoryIsActive"
                    checked={categoryFormData.isActive}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="categoryIsActive" className="text-sm font-medium text-gray-700">
                    Categoría activa
                  </label>
                </div>

                {/* Botones */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={categoryFormLoading}
                    className="flex-1 bg-gradient-primary text-white py-2 px-4 rounded-md font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {categoryFormLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Categoría'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-semibold hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
