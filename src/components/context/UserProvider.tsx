import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { type User } from "../../types/User";
import { UserContext } from "./UserContext";
import { setGlobalUserContext } from "./UserContext";
import { authentificatedRequest } from "../../controllers/api/axiosInstance";

interface UserContextType {
  user: User | null;
  isInitializing: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const login = useCallback((userData: User) => {
    setUser((prev) => (prev?.id === userData.id ? prev : userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const contextValue = useMemo<UserContextType>(
    () => ({ user, isInitializing, login, logout }),
    [user, isInitializing, login, logout]
  );

  useEffect(() => {
    setGlobalUserContext(contextValue);
    return () => setGlobalUserContext(null);
  }, [contextValue]);

  // Восстановление сессии при загрузке/обновлении страницы
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setIsInitializing(false);
      return;
    }

    authentificatedRequest(token)
      .get("/api/users/me?populate=role")
      .then((res) => {
        if (active) setUser(res.data);
      })
      .catch((error) => {
        console.error("Auth check failed:", error);
        localStorage.removeItem("auth_token");
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
