// Tipos para las respuestas de autenticación
import { signInWithCustomTokenAsync, getIdToken } from './firebase';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// Usuario de registro (estructura diferente a User completo)
export interface RegisterUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    idToken: string;
    firebaseUid: string;
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: RegisterUser;
    customToken: string;
    firebaseUid: string;
  };
}

// Claves para localStorage
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  FIREBASE_TOKEN: 'firebase_token',
  ROLE: 'auth_role',
  USER: 'auth_user',
  FIREBASE_UID: 'firebase_uid',
} as const;

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error al iniciar sesión. Verifica tus credenciales.',
        }));
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // El backend ahora devuelve idToken directamente (ya es un ID token de Firebase)
        const idToken = data.data.idToken;
        
        if (!idToken) {
          throw new Error('No se recibió el idToken en la respuesta del servidor');
        }
        
        // Verificar que el token recibido no sea un customToken
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            const isCustomToken = payload.iss && payload.iss.includes('firebase-adminsdk') && payload.uid !== undefined;
            if (isCustomToken) {
              throw new Error('El servidor devolvió un customToken en lugar de un idToken');
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes('customToken')) {
              throw error;
            }
            // Si hay error al parsear, continuar (puede ser un token válido)
          }
        }
        
        // Guardar el ID token en firebase_token (este es el que se debe usar en las peticiones)
        localStorage.setItem(STORAGE_KEYS.FIREBASE_TOKEN, idToken);
        
        // También guardar en auth_token para compatibilidad
        localStorage.setItem(STORAGE_KEYS.TOKEN, idToken);
        
        // Guardar el firebaseUid
        if (data.data.firebaseUid) {
          localStorage.setItem(STORAGE_KEYS.FIREBASE_UID, data.data.firebaseUid);
        }
        
        // Guardar información del usuario
        localStorage.setItem(STORAGE_KEYS.ROLE, data.data.user.role);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
        
        console.log('ID token guardado exitosamente:', idToken.substring(0, 50) + '...');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión. Por favor intenta de nuevo.');
    }
  },

  /**
   * Obtener token del localStorage (preferir Firebase token si está disponible)
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Preferir Firebase token si está disponible
    const firebaseToken = localStorage.getItem(STORAGE_KEYS.FIREBASE_TOKEN);
    if (firebaseToken) return firebaseToken;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Obtener role del localStorage
   */
  getRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ROLE);
  },

  /**
   * Obtener usuario del localStorage
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_UID);
  },

  /**
   * Registrarse
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error al registrarse. Por favor intenta de nuevo.',
        }));
        throw new Error(errorData.message || 'Error al registrarse');
      }

      const result: RegisterResponse = await response.json();

      if (result.success && result.data) {
        try {
          // Autenticar con Firebase usando el customToken
          const userCredential = await signInWithCustomTokenAsync(result.data.customToken);
          const firebaseToken = await userCredential.user.getIdToken();

          // Guardar en localStorage
          localStorage.setItem(STORAGE_KEYS.FIREBASE_TOKEN, firebaseToken);
          localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.customToken);
          localStorage.setItem(STORAGE_KEYS.FIREBASE_UID, result.data.firebaseUid);
          localStorage.setItem(STORAGE_KEYS.ROLE, result.data.user.role);
          
          // Convertir RegisterUser a User para guardar
          const userToSave: User = {
            id: result.data.user.id,
            firstName: result.data.user.firstName,
            lastName: result.data.user.lastName,
            email: result.data.user.email,
            phone: data.phone, // Usar el phone del request
            role: result.data.user.role,
            isActive: true,
            emailVerified: result.data.user.emailVerified,
            createdAt: {
              _seconds: Math.floor(Date.now() / 1000),
              _nanoseconds: 0,
            },
            updatedAt: {
              _seconds: Math.floor(Date.now() / 1000),
              _nanoseconds: 0,
            },
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSave));
        } catch (firebaseError) {
          console.error('Error al autenticar con Firebase:', firebaseError);
          // Aún así guardamos los datos básicos
          localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.customToken);
          localStorage.setItem(STORAGE_KEYS.FIREBASE_UID, result.data.firebaseUid);
          localStorage.setItem(STORAGE_KEYS.ROLE, result.data.user.role);
        }
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión. Por favor intenta de nuevo.');
    }
  },

  /**
   * Registrarse con Google
   */
  async registerWithGoogle(): Promise<RegisterResponse> {
    try {
      const { signInWithGoogleAsync } = await import('./firebase');
      // Autenticar con Google usando Firebase
      const userCredential = await signInWithGoogleAsync();
      const googleToken = await userCredential.user.getIdToken();
      
      // Obtener información del usuario de Google
      const displayName = userCredential.user.displayName || '';
      const email = userCredential.user.email || '';
      const [firstName = '', ...lastNameParts] = displayName.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // Enviar token de Google al backend para crear el usuario
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password: '', // No se necesita password para Google
          phone: '', // Se puede completar después
          address: '', // Se puede completar después
          googleToken, // Token de Google para verificar
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error al registrarse con Google. Por favor intenta de nuevo.',
        }));
        throw new Error(errorData.message || 'Error al registrarse con Google');
      }

      const result: RegisterResponse = await response.json();

      if (result.success && result.data) {
        try {
          // Autenticar con Firebase usando el customToken
          const { signInWithCustomTokenAsync } = await import('./firebase');
          const firebaseCredential = await signInWithCustomTokenAsync(result.data.customToken);
          const firebaseToken = await firebaseCredential.user.getIdToken();

          // Guardar en localStorage
          localStorage.setItem(STORAGE_KEYS.FIREBASE_TOKEN, firebaseToken);
          localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.customToken);
          localStorage.setItem(STORAGE_KEYS.FIREBASE_UID, result.data.firebaseUid);
          localStorage.setItem(STORAGE_KEYS.ROLE, result.data.user.role);
          
          // Convertir RegisterUser a User para guardar
          const userToSave: User = {
            id: result.data.user.id,
            firstName: result.data.user.firstName,
            lastName: result.data.user.lastName,
            email: result.data.user.email,
            phone: '', // No disponible en registro con Google
            role: result.data.user.role,
            isActive: true,
            emailVerified: result.data.user.emailVerified,
            createdAt: {
              _seconds: Math.floor(Date.now() / 1000),
              _nanoseconds: 0,
            },
            updatedAt: {
              _seconds: Math.floor(Date.now() / 1000),
              _nanoseconds: 0,
            },
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSave));
        } catch (firebaseError) {
          console.error('Error al autenticar con Firebase:', firebaseError);
          // Aún así guardamos los datos básicos
          localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.customToken);
          localStorage.setItem(STORAGE_KEYS.FIREBASE_UID, result.data.firebaseUid);
          localStorage.setItem(STORAGE_KEYS.ROLE, result.data.user.role);
        }
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión. Por favor intenta de nuevo.');
    }
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

