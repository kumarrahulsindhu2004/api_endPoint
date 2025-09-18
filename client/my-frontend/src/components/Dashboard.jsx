"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalMenuItems: 0,
    chefs: 0,
    waiters: 0,
    managers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingTime, setLoadingTime] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    let timer
    if (loading) {
      timer = setInterval(() => {
        setLoadingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setLoadingTime(0)
    }
    return () => clearInterval(timer)
  }, [loading])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setLoadingTime(0)
      setError(null)
      console.log("[v0] Attempting to fetch stats from backend...")

      const [personsResponse, menuResponse] = await Promise.all([api.get("/person"), api.get("/menu")])

      console.log("[v0] Persons response:", personsResponse.data)
      console.log("[v0] Menu response:", menuResponse.data)

      const persons = personsResponse.data
      const menuItems = menuResponse.data

      const workStats = persons.reduce((acc, person) => {
        acc[person.work] = (acc[person.work] || 0) + 1
        return acc
      }, {})

      setStats({
        totalPersons: persons.length,
        totalMenuItems: menuItems.length,
        chefs: workStats.chef || 0,
        waiters: workStats.waiter || 0,
        managers: workStats.manager || 0,
      })
      console.log("[v0] Stats updated successfully")
    } catch (error) {
      console.error("Error fetching stats:", error)
      console.log("[v0] Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      })

      if (error.isConnectionError) {
        setError("Cannot connect to the backend server. Please check if your backend is running.")
      } else if (error.response?.status === 401) {
        setError("Authentication required. Please log in again.")
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.")
      } else {
        setError(`Failed to load dashboard data: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <h3>Loading dashboard...</h3>
          {loadingTime > 5 && (
            <p style={{ color: "#666", marginTop: "10px" }}>
              Server is warming up... This may take up to 60 seconds on first load.
            </p>
          )}
          {loadingTime > 0 && <p style={{ color: "#888", fontSize: "0.9rem" }}>Loading time: {loadingTime} seconds</p>}
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 style={{ marginBottom: "30px" }}>Dashboard</h1>
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#dc3545", marginBottom: "20px" }}>Connection Error</h3>
          <p style={{ marginBottom: "20px", color: "#666" }}>{error}</p>
          <button onClick={fetchStats} className="btn btn-primary" style={{ marginRight: "10px" }}>
            Retry Connection
          </button>
          <div style={{ marginTop: "20px", fontSize: "0.9rem", color: "#888" }}>
            <p>To start your backend server:</p>
            <p>1. Navigate to your backend folder</p>
            <p>
              2. Run: <code style={{ background: "#f5f5f5", padding: "2px 6px" }}>npm start</code> or{" "}
              <code style={{ background: "#f5f5f5", padding: "2px 6px" }}>node server.js</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: "30px" }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ color: "#007bff", fontSize: "2rem", marginBottom: "10px" }}>{stats.totalPersons}</h3>
          <p style={{ fontSize: "1.1rem", marginBottom: "15px" }}>Total Staff</p>
          <Link to="/persons" className="btn btn-primary">
            Manage Staff
          </Link>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ color: "#28a745", fontSize: "2rem", marginBottom: "10px" }}>{stats.totalMenuItems}</h3>
          <p style={{ fontSize: "1.1rem", marginBottom: "15px" }}>Menu Items</p>
          <Link to="/menu" className="btn btn-success">
            Manage Menu
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>Staff Distribution</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ color: "#dc3545", fontSize: "1.5rem" }}>{stats.chefs}</h4>
            <p>Chefs</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ color: "#ffc107", fontSize: "1.5rem" }}>{stats.waiters}</h4>
            <p>Waiters</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ color: "#17a2b8", fontSize: "1.5rem" }}>{stats.managers}</h4>
            <p>Managers</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
