import axios from "axios";

export const publicRequest = axios.create({
  baseURL: "http://185.167.98.251:1337",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export function authentificatedRequest(token: string) {
  return axios.create({
    baseURL: "http://185.167.98.251:1337",
    withCredentials: false,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
}
