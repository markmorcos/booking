import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { setTokenGetter, apiPost, apiGet } from '@/api/client';
import { FIREBASE_WEB_CLIENT_ID } from '@/firebase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  isAdmin: boolean;
  token: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAdmin: false,
  token: null,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

GoogleSignin.configure({
  webClientId: FIREBASE_WEB_CLIENT_ID,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseAuthTypes.User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      const idToken = await firebaseUser.getIdToken(false);
      setToken(idToken);
      return idToken;
    } catch {
      return token;
    }
  }, [firebaseUser, token]);

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  const syncWithBackend = useCallback(
    async (fbUser: FirebaseAuthTypes.User) => {
      try {
        const idToken = await fbUser.getIdToken(true);
        setToken(idToken);
        const tokenGetter = async (): Promise<string | null> => idToken;
        setTokenGetter(tokenGetter);

        const profile = await apiPost<User>('/auth/register', {
          name: fbUser.displayName ?? '',
          email: fbUser.email ?? '',
        });
        setUser(profile);
      } catch (error) {
        console.error('Failed to sync with backend:', error);
        // Still allow the user to be "logged in" with Firebase
        // even if backend sync fails
      }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await syncWithBackend(fbUser);
      } else {
        setUser(null);
        setToken(null);
      }
      if (initializing) {
        setInitializing(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [initializing, syncWithBackend]);

  // Token refresh interval
  useEffect(() => {
    if (!firebaseUser) return;

    const interval = setInterval(
      async () => {
        try {
          const newToken = await firebaseUser.getIdToken(true);
          setToken(newToken);
        } catch {
          // ignore refresh failures
        }
      },
      // Refresh every 50 minutes (tokens expire at 60)
      50 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [firebaseUser]);

  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken ?? null;
      if (!idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.revokeAccess();
    } catch {
      // ignore
    }
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore
    }
    await auth().signOut();
    setUser(null);
    setToken(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const profile = await apiGet<User>('/auth/me');
      setUser(profile);
    } catch {
      // ignore
    }
  }, [firebaseUser]);

  const isAdmin = user?.role === 'admin';

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      isLoading: isLoading || initializing,
      isAdmin,
      token,
      signIn,
      signOut,
      refreshProfile,
    }),
    [
      user,
      firebaseUser,
      isLoading,
      initializing,
      isAdmin,
      token,
      signIn,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
