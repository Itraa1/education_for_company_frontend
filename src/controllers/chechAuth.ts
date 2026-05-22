import { authentificatedRequest } from "./api/axiosInstance";
import { getGlobalUserContext } from "../components/context/UserContext";

export async function checkAuth() {

  const token = localStorage.getItem("auth_token");
  console.log(token);

  if (!token) {
    return false;
  }
  try {
    const authRequest = authentificatedRequest(token);
    const res = await authRequest.get("/api/users/me?populate=role");
    const { login } = getGlobalUserContext();

    login(res.data);
    // console.log(res);
    return true;
  } catch (error) {
    console.log(error);
    // logout();
    localStorage.removeItem("auth_token");
    return false;
  }
}
