import { authentificatedRequest } from "./api/axiosInstance";
import { getGlobalUserContext } from "../components/context/UserContext";

let authCheckPromise: Promise<boolean> | null = null;

export async function checkAuth(force = false): Promise<boolean> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return false;
  }

  try {
    const { user, login } = getGlobalUserContext();

    if (!force && user) {
      return true;
    }

    if (!force && authCheckPromise) {
      return authCheckPromise;
    }

    authCheckPromise = (async () => {
      try {
        const authRequest = authentificatedRequest(token);
        const res = await authRequest.get("/api/users/me?populate=role");
        login(res.data);
        return true;
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("auth_token");
        return false;
      } finally {
        authCheckPromise = null;
      }
    })();

    return authCheckPromise;
  } catch {
    return false;
  }
}

export function resetAuthCache() {
  authCheckPromise = null;
}
