import { useContext, createContext } from 'react';
import { type User } from "../../types/User";

interface UserContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within UserProvider");
    }
    return context;
};

let globalUserContext: UserContextType | null = null;

export const setGlobalUserContext = (context: UserContextType | null) => {
  globalUserContext = context;
};

export const getGlobalUserContext = () => {
  if (!globalUserContext) {
    throw new Error("UserContext not initialized");
  }
  return globalUserContext;
};