import { authentificatedRequest } from "./api/axiosInstance";

export async function checkAuth() {
  const token = localStorage.getItem("auth_token");
  console.log(token);
  if (!token) {
    return false;
  }
  try {
    const authRequest = authentificatedRequest(token);
    const res = await authRequest.get("/api/users/me");
    console.log(res);
    return true;
  } catch (error) {
    console.log(error);
    localStorage.removeItem("auth_token");
    return false;
  }
}
