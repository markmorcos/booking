import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSetUser = async (newUser: User | null) => {
    try {
      if (newUser) {
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        await AsyncStorage.setItem("userEmail", newUser.email);
      } else {
        await AsyncStorage.multiRemove(["user", "userEmail"]);
      }
      setUser(newUser);
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
