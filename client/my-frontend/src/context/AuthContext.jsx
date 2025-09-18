"use client"

import { createContext, useState, useContext, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      // You could verify the token here by making a request to a protected route
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await api.post("/login", { username, password })
      const { token } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser({ token, username })

      return { success: true }
    } catch (error) {
      if (error.isConnectionError) {
        return {
          success: false,
          message: "Cannot connect to server. Please make sure the backend is running on port 3000.",
        }
      }
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials.",
      }
    }
  }

  const signup = async (userData) => {
    try {
      console.log("[v0] Attempting signup with data:", userData)
      const response = await api.post("/signup", userData)
      console.log("[v0] Signup successful:", response.data)
      return { success: true }
    } catch (error) {
      console.log("[v0] Signup error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isConnectionError: error.isConnectionError,
      })

      if (error.isConnectionError) {
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection.",
        }
      }

      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data?.message || "Invalid data provided. Please check all fields.",
        }
      }

      if (error.response?.status === 409) {
        return {
          success: false,
          message: "Username or email already exists. Please choose different ones.",
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Signup failed. Please try again.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
