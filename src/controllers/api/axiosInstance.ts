import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const publicRequest = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export function authentificatedRequest(token: string) {
  return axios.create({
    baseURL,
    withCredentials: false,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
}
