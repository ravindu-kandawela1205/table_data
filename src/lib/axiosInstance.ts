import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://dummyjson.com", // ✅ base URL for DummyJSON
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;
