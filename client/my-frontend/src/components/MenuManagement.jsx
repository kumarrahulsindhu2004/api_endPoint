"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingTime, setLoadingTime] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    taste: "sweet",
    is_drink: false,
    ingredients: "",
    num_sales: 0,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchMenuItems()
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

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      setLoadingTime(0)
      setError("") // Clear previous errors
      const response = await api.get("/menu")
      setMenuItems(response.data)
    } catch (error) {
      if (error.isConnectionError) {
        setError("Cannot connect to server. Please make sure the backend is running.")
      } else {
        setError("Failed to fetch menu items. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const submitData = {
      ...formData,
      ingredients: formData.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
    }

    try {
      if (editingItem) {
        await api.put(`/menu/id/${editingItem._id}`, submitData)
        setSuccess("Menu item updated successfully")
      } else {
        await api.post("/menu", submitData)
        setSuccess("Menu item added successfully")
      }

      fetchMenuItems()
      setShowModal(false)
      resetForm()
    } catch (error) {
      if (error.isConnectionError) {
        setError("Cannot connect to server. Please make sure the backend is running.")
      } else {
        setError(error.response?.data?.error || "Operation failed. Please try again.")
      }
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price,
      taste: item.taste,
      is_drink: item.is_drink,
      ingredients: item.ingredients.join(", "),
      num_sales: item.num_sales,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await api.delete(`/menu/${id}`)
        setSuccess("Menu item deleted successfully")
        fetchMenuItems()
      } catch (error) {
        if (error.isConnectionError) {
          setError("Cannot connect to server. Please make sure the backend is running.")
        } else {
          setError("Failed to delete menu item. Please try again.")
        }
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      taste: "sweet",
      is_drink: false,
      ingredients: "",
      num_sales: 0,
    })
    setEditingItem(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
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
          <h3>Loading menu items...</h3>
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

  if (error && error.includes("Cannot connect to server")) {
    return (
      <div>
        <h1>Menu Management</h1>
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#dc3545", marginBottom: "20px" }}>Connection Error</h3>
          <p style={{ marginBottom: "20px", color: "#666" }}>{error}</p>
          <button onClick={fetchMenuItems} className="btn btn-primary">
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Menu Management</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          Add New Item
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Taste</th>
              <th>Type</th>
              <th>Ingredients</th>
              <th>Sales</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>${item.price}</td>
                <td style={{ textTransform: "capitalize" }}>{item.taste}</td>
                <td>{item.is_drink ? "Drink" : "Food"}</td>
                <td>{item.ingredients.join(", ")}</td>
                <td>{item.num_sales}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="btn btn-secondary" style={{ marginRight: "8px" }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taste">Taste</label>
                <select id="taste" name="taste" value={formData.taste} onChange={handleInputChange} required>
                  <option value="sweet">Sweet</option>
                  <option value="spicy">Spicy</option>
                  <option value="sour">Sour</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_drink"
                    checked={formData.is_drink}
                    onChange={handleInputChange}
                    style={{ marginRight: "8px" }}
                  />
                  Is Drink
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="ingredients">Ingredients (comma separated)</label>
                <input
                  type="text"
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="e.g., tomato, cheese, bread"
                />
              </div>

              <div className="form-group">
                <label htmlFor="num_sales">Number of Sales</label>
                <input
                  type="number"
                  id="num_sales"
                  name="num_sales"
                  value={formData.num_sales}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? "Update" : "Add"} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement
