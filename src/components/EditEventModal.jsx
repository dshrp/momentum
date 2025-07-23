"use client"

import { useState, useEffect } from "react"
import { X, Save, AlertCircle, AlertTriangle, Key, CheckCircle } from "lucide-react"

const EditEventModal = ({ event, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    Title: "",
    Time: "",
    Date: "",
    Venue: "",
    Location: "",
    Description: "",
    Event_Type: "Event",
    Not_Shown: false,
  })
  const [hidePassword, setHidePassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      console.log("🔄 Initializing form with event data:", {
        eventId: event.id,
        eventHidden: event.hidden,
        eventTitle: event.title,
      })

      setFormData({
        Title: event.title || "",
        Time: event.time || "",
        Date: event.date ? event.date.split("T")[0] : "",
        Venue: event.venue || "",
        Location: event.location || "",
        Description: event.description || "",
        Event_Type: event.type || "Event",
        Not_Shown: event.hidden || false, // This should properly reflect the current hidden status
      })
    }
  }, [event])

  // Fetch fresh event data when modal opens to ensure we have latest hidden status
  useEffect(() => {
    if (isOpen && event) {
      console.log("🔄 Modal opened, checking for fresh event data...")
      // We could add a refresh here if needed, but for now let's see if the parent component handles it
    }
  }, [isOpen, event])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!event) return

    // If trying to hide the event, validate password
    if (formData.Not_Shown && !event.hidden) {
      console.log("🔒 Password validation:", {
        entered: hidePassword,
        required: "onlyforamomentum",
        matches: hidePassword === "onlyforamomentum",
        currentEventHidden: event.hidden,
        formNotShown: formData.Not_Shown,
      })

      if (hidePassword !== "onlyforamomentum") {
        setError("Incorrect password required to hide events. Contact the admin for access.")
        return
      }
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("🚀 Starting edit request:", {
        eventId: event.id,
        formData: formData,
        apiUrl: `/api/events/${event.id}`,
        isHiding: formData.Not_Shown && !event.hidden,
        currentEventHidden: event.hidden,
      })

      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("📡 Edit response status:", response.status)

      const responseText = await response.text()
      console.log("📄 Raw response text:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
        console.log("✅ Parsed response:", result)
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", parseError)
        throw new Error(`Invalid response format: ${responseText}`)
      }

      if (!response.ok) {
        console.error("❌ Edit request failed:", {
          status: response.status,
          result: result,
        })
        throw new Error(result.details || result.error || "Failed to update event")
      }

      console.log("🎉 Edit successful:", result)

      // If we successfully hid the event, show success message and delay refresh
      if (formData.Not_Shown && !event.hidden) {
        console.log("✅ Event was successfully hidden!")
        setSuccess("Event hidden successfully! Page will refresh in 5 seconds...")

        // Wait 5 seconds before refreshing so user can see the logs
        setTimeout(() => {
          console.log("🔄 Refreshing page to update event list...")
          window.location.reload()
        }, 5000)
        return
      }

      // For regular edits, just close and refresh data
      onSave(result.record)
      onClose()
    } catch (err) {
      console.error("💥 Edit error:", err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    console.log("📝 Form field changed:", { field, value, eventId: event?.id })
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user makes changes
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: "3px solid #1A1A1A" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
            Edit Event Details
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
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
              <p className="text-sm text-green-600">{success}</p>
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
              <p className="font-semibold text-red-800">Error updating event</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Missing Data Helper */}
        {event.missingData &&
          (event.missingData.title || event.missingData.time || event.missingData.venue || event.missingData.date) && (
            <div
              className="p-4 rounded-xl mb-6 flex items-center gap-3"
              style={{
                border: "2px solid #F59E0B",
                backgroundColor: "#FEF3C7",
              }}
            >
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">Missing Information Detected</p>
                <p className="text-sm text-amber-700">
                  Please fill in the missing details to improve this event:
                  {event.missingData.title && " Title"}
                  {event.missingData.date && " Date"}
                  {event.missingData.time && " Time"}
                  {event.missingData.venue && " Venue"}
                </p>
              </div>
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Event Title
              </label>
              <input
                type="text"
                value={formData.Title}
                onChange={(e) => handleChange("Title", e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Event Type
              </label>
              <select
                value={formData.Event_Type}
                onChange={(e) => handleChange("Event_Type", e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
              >
                <option value="Event">Event</option>
                <option value="DJ Gig">DJ Gig</option>
                <option value="Concert">Concert</option>
                <option value="Party">Party</option>
                <option value="Festival">Festival</option>
                <option value="Reading">Reading</option>
                <option value="Pop-up">Pop-up</option>
                <option value="Show">Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Date
              </label>
              <input
                type="date"
                value={formData.Date}
                onChange={(e) => handleChange("Date", e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Time
              </label>
              <input
                type="text"
                value={formData.Time}
                onChange={(e) => handleChange("Time", e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
                placeholder="e.g., 8:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Venue
              </label>
              <input
                type="text"
                value={formData.Venue}
                onChange={(e) => handleChange("Venue", e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
                placeholder="Venue name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Location
              </label>
              <input
                type="text"
                value={formData.Location}
                onChange={(e) => handleChange("Location", e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#FEFCF5",
                  color: "#1A1A1A",
                }}
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
              Description
            </label>
            <textarea
              value={formData.Description}
              onChange={(e) => handleChange("Description", e.target.value)}
              disabled={saving}
              rows={3}
              className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: "#FEFCF5",
                color: "#1A1A1A",
              }}
              placeholder="Event description"
            />
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "#F0F9FF",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "#1E40AF" }}>
              💡 <strong>Note:</strong> Your changes will be saved and help improve the accuracy of future event
              detection. Thanks for keeping things up to date!
            </p>
          </div>

          {/* Danger Zone */}
          <div
            className="p-6 rounded-xl"
            style={{
              border: "2px solid #DC2626",
              backgroundColor: "#FEF2F2",
            }}
          >
            <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h4>
            <p className="text-sm text-red-700 mb-4">
              Hide this event from your dashboard. The event will remain in the backend but won't appear in your event
              list. This is useful for removing duplicates.
            </p>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.Not_Shown}
                  onChange={(e) => handleChange("Not_Shown", e.target.checked)}
                  disabled={saving}
                  className="w-4 h-4 text-red-600 border-2 border-red-600 rounded focus:ring-red-500 disabled:opacity-50"
                />
                <span className="font-semibold text-red-800">Hide this event from my dashboard</span>
              </label>

              {/* Password field - only show if trying to hide and not already hidden */}
              {formData.Not_Shown && !event.hidden && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-red-800">Password Required to Hide</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={hidePassword}
                      onChange={(e) => setHidePassword(e.target.value)}
                      disabled={saving}
                      placeholder="Enter password to hide event"
                      className="w-full pl-12 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      style={{
                        border: "2px solid #DC2626",
                        backgroundColor: "#FEFCF5",
                        color: "#1A1A1A",
                      }}
                    />
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-xs text-red-600 mt-1">This will permanently hide the event from your dashboard.</p>
                </div>
              )}

              {/* Show unhide option if event is currently hidden */}
              {event.hidden && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>This event is currently hidden.</strong> Uncheck the box above to make it visible again.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "#1E40AF",
                border: "2px solid #1A1A1A",
              }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {formData.Not_Shown && !event.hidden
                    ? "Hiding..."
                    : !formData.Not_Shown && event.hidden
                      ? "Unhiding..."
                      : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {formData.Not_Shown && !event.hidden
                    ? "Hide Event"
                    : !formData.Not_Shown && event.hidden
                      ? "Unhide Event"
                      : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEventModal
