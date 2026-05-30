import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';

// Configuración de Firebase
// TODO: Reemplazar con las credenciales reales de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id"
};

// Inicializar Firebase solo si no está ya inicializado
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Obtener instancia de Auth
export const auth: Auth = getAuth(app);

// Provider de Google
export const googleProvider = new GoogleAuthProvider();

/**
 * Autenticar con custom token de Firebase
 */
export async function signInWithCustomTokenAsync(customToken: string): Promise<{ user: FirebaseUser }> {
  return await signInWithCustomToken(auth, customToken);
}

/**
 * Autenticar con Google
 */
export async function signInWithGoogleAsync(): Promise<{ user: FirebaseUser }> {
  return await signInWithPopup(auth, googleProvider);
}

/**
 * Obtener el token de ID de Firebase
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export default app;

