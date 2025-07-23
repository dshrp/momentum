"use client"

import { useState } from "react"
import { X, Plus, Instagram, Loader, CheckCircle, AlertCircle, User, AtSign, Key } from "lucide-react"

const AddSourceModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    platform: "Instagram",
    username: "",
    friendName: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate password first
    if (formData.password !== "onlyforamomentum") {
      setError("Incorrect password. Contact the admin for access.")
      return
    }

    if (!formData.username || !formData.friendName) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok && !result.mockMode) {
        throw new Error(result.error || "Failed to add source")
      }

      setSuccess(
        "Successfully added! We refresh events daily, so check back starting tomorrow to see if any new events have been posted.",
      )

      // Clear form
      setFormData({
        platform: "Instagram",
        username: "",
        friendName: "",
        password: "",
      })

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.(result)
        onClose()
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        platform: "Instagram",
        username: "",
        friendName: "",
        password: "",
      })
      setError(null)
      setSuccess(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 pt-8 sm:pt-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-8 w-full max-w-md my-auto" style={{ border: "3px solid #1A1A1A" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
            Add New Source
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-xl hover:opacity-70 transition-opacity disabled:opacity-50"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "white",
              color: "#4A4A4A",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center gap-3"
            style={{
              border: "2px solid #16A34A",
              backgroundColor: "#DCFCE7",
            }}
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Success!</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center gap-3"
            style={{
              border: "2px solid #DC2626",
              backgroundColor: "#FEF2F2",
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Selection - Simplified */}
          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: "#1A1A1A" }}>
              Platform
            </label>
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: "#FEFCF5",
              }}
            >
              <Instagram className="w-5 h-5" style={{ color: "#E1306C" }} />
              <span className="font-medium" style={{ color: "#1A1A1A" }}>
                Instagram
              </span>
            </div>
          </div>

          {/* Friend Name */}
          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: "#1A1A1A" }}>
              Friend's Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.friendName}
                onChange={(e) => handleChange("friendName", e.target.value)}
                disabled={loading}
                placeholder="e.g., Alex Chen"
                className="w-full pl-12 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
              />
              <User
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "#4A4A4A" }}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: "#1A1A1A" }}>
              Instagram Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={loading}
                placeholder="username (without @)"
                className="w-full pl-12 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
              />
              <AtSign
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "#4A4A4A" }}
              />
            </div>
          </div>

          {/* Enhanced Info Box */}
          <div
            className="p-4 rounded-xl"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "#F0F9FF",
            }}
          >
            <p className="text-sm font-medium mb-3" style={{ color: "#1E40AF" }}>
              💡 <strong>How it works:</strong> We'll automatically start monitoring this Instagram account for event posts. New events will appear in your dashboard once a day.
            </p>

            <div className="space-y-2 text-sm" style={{ color: "#1E40AF" }}>
              <p>
                <strong>✅ Works best with:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Public Instagram accounts</li>
                <li>Accounts that post events to their grid</li>
                <li>DJs, artists, venues, and event organizers</li>
                <li>Accounts with event-related hashtags and captions</li>
              </ul>

              <p className="mt-3">
                <strong>❌ Won't work with:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Private accounts (we can't access their posts)</li>
                <li>Accounts that only post events to stories</li>
                <li>Accounts with no recent grid posts</li>
                <li>Personal accounts without event content</li>
              </ul>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: "#1A1A1A" }}>
              Access Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={loading}
                placeholder="Enter access password"
                className="w-full pl-12 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
              />
              <Key
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "#4A4A4A" }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl font-bold transition-opacity hover:opacity-70 disabled:opacity-50"
              style={{
                border: "2px solid #1A1A1A",
                color: "#1A1A1A",
                backgroundColor: "white",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.username || !formData.friendName || !formData.password}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "#1E40AF",
                border: "2px solid #1A1A1A",
              }}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Source
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSourceModal
