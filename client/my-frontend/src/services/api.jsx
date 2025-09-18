import axios from "axios"

const api = axios.create({
  baseURL: "https://api-endpoint-imzw.onrender.com", // Your deployed backend URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Increased timeout for deployed server
})

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK" || !error.response) {
      error.isConnectionError = true
      error.message = "Unable to connect to server. Please check your internet connection or try again later."
    }
    return Promise.reject(error)
  },
)

export default api
