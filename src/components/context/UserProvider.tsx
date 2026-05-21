import { useState, type ReactNode,useEffect } from "react";
import { type User } from "../../types/User";
import { UserContext } from "./UserContext";
import { setGlobalUserContext } from "./UserContext";

interface UserContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

interface UserProviderProps {
  children: ReactNode;
}


export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  const contextValue: UserContextType = { user, login, logout };

  useEffect(() => {
    // Передаем контекст в глобальную переменную
    setGlobalUserContext(contextValue);
    return () => setGlobalUserContext(null);
  }, [contextValue]);
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};


