import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { type User } from "../../types/User";
import { UserContext } from "./UserContext";
import { setGlobalUserContext } from "./UserContext";
import { checkAuth } from "../../controllers/chechAuth";

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

  const login = useCallback((userData: User) => {
    setUser((prev) => (prev?.id === userData.id ? prev : userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const contextValue = useMemo<UserContextType>(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  useEffect(() => {
    setGlobalUserContext(contextValue);
    return () => setGlobalUserContext(null);
  }, [contextValue]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      checkAuth();
    }
  }, []);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
