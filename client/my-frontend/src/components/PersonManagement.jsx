"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const PersonManagement = () => {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingTime, setLoadingTime] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    work: "waiter",
    mobile: "",
    email: "",
    address: "",
    salary: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchPersons()
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

  const fetchPersons = async () => {
    try {
      setLoading(true)
      setLoadingTime(0)
      setError("") // Clear previous errors
      const response = await api.get("/person")
      setPersons(response.data)
    } catch (error) {
      if (error.isConnectionError) {
        setError("Cannot connect to server. Please make sure the backend is running.")
      } else {
        setError("Failed to fetch staff data. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      if (editingPerson) {
        await api.put(`/person/id/${editingPerson._id}`, formData)
        setSuccess("Staff member updated successfully")
      } else {
        await api.post("/person", formData)
        setSuccess("Staff member added successfully")
      }

      fetchPersons()
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

  const handleEdit = (person) => {
    setEditingPerson(person)
    setFormData({
      name: person.name,
      age: person.age,
      work: person.work,
      mobile: person.mobile,
      email: person.email,
      address: person.address,
      salary: person.salary,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await api.delete(`/person/${id}`)
        setSuccess("Staff member deleted successfully")
        fetchPersons()
      } catch (error) {
        if (error.isConnectionError) {
          setError("Cannot connect to server. Please make sure the backend is running.")
        } else {
          setError("Failed to delete staff member. Please try again.")
        }
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      work: "waiter",
      mobile: "",
      email: "",
      address: "",
      salary: "",
    })
    setEditingPerson(null)
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
          <h3>Loading staff data...</h3>
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
        <h1>Staff Management</h1>
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#dc3545", marginBottom: "20px" }}>Connection Error</h3>
          <p style={{ marginBottom: "20px", color: "#666" }}>{error}</p>
          <button onClick={fetchPersons} className="btn btn-primary">
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Staff Management</h1>
        <button onClick={openAddModal} className="btn btn-primary">
          Add New Staff
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Work</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((person) => (
              <tr key={person._id}>
                <td>{person.name}</td>
                <td>{person.age}</td>
                <td style={{ textTransform: "capitalize" }}>{person.work}</td>
                <td>{person.mobile}</td>
                <td>{person.email}</td>
                <td>${person.salary}</td>
                <td>
                  <button
                    onClick={() => handleEdit(person)}
                    className="btn btn-secondary"
                    style={{ marginRight: "8px" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(person._id)} className="btn btn-danger">
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
              <h3 className="modal-title">{editingPerson ? "Edit Staff Member" : "Add New Staff Member"}</h3>
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
                <label htmlFor="age">Age</label>
                <input type="number" id="age" name="age" value={formData.age} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label htmlFor="work">Work Type</label>
                <select id="work" name="work" value={formData.work} onChange={handleInputChange} required>
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary</label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPerson ? "Update" : "Add"} Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonManagement
