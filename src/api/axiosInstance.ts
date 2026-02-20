import axios from "axios";

 const token = ""
const axiosInstance = axios.create({
    baseURL:"http://localhost:1337",
    withCredentials: false,
     headers: {
    'Content-Type': 'application/json',
     "Authorization": `Bearer ${token}`
  },
});

export default axiosInstance;