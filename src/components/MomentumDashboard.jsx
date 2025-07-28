"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Clock, MapPin, ExternalLink, Edit, EyeOff, RefreshCw, Plus } from "lucide-react"
import { trackMomentumEvent } from "../../lib/analytics"
import EditEventModal from "./EditEventModal"
import AddSourceModal from "./AddSourceModal"

export default function MomentumDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showAddSource, setShowAddSource] = useState(false)

  const fetchEvents = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true)
        trackMomentumEvent.refreshEvents()
      } else {
        setLoading(true)
      }

      setError(null)

      // Super aggressive cache busting
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const cacheBuster = `${timestamp}-${random}`

      // Clear all possible caches
      if ("caches" in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }

      const response = await fetch(`/api/events-clean?cb=${cacheBuster}&t=${timestamp}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Dashboard: Fetched events:", data.length)

      setEvents(data)
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleRefresh = () => {
    fetchEvents(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    trackMomentumEvent.editEvent(event.id)
  }

  const handleHideEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hidden: true }),
      })

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventId))
        trackMomentumEvent.hideEvent(eventId)
      }
    } catch (error) {
      console.error("Error hiding event:", error)
    }
  }

  const handleAddToCalendar = (event) => {
    const startDate = new Date(event.date)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours later

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.venue || "")}`

    window.open(calendarUrl, "_blank")
    trackMomentumEvent.addToCalendar(event.id)
  }

  const handleViewSource = (event) => {
    if (event.source_url) {
      window.open(event.source_url, "_blank")
      trackMomentumEvent.viewEvent(event.id)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString
      }
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  const formatTime = (timeString) => {
    if (!timeString || timeString === "TBD") return timeString

    try {
      // Handle various time formats
      if (timeString.includes(" - ")) {
        return timeString // Already formatted range
      }

      const date = new Date(`2000-01-01 ${timeString}`)
      if (isNaN(date.getTime())) {
        return timeString
      }

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return timeString
    }
  }

  const getEventTypeColor = (type) => {
    const colors = {
      "DJ Gig": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Art Exhibition": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Exhibition: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Walking Tour": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Instagram: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "User Updated": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    }
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error loading events: {error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Events</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {events.length} upcoming events from your followed accounts
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddSource(true)
                trackMomentumEvent.addSource("manual")
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Source
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="SUPER refresh - clears all caches and fetches fresh data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Add some Instagram accounts or RA profiles to start tracking events
            </p>
            <button
              onClick={() => setShowAddSource(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Source
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Event Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.type && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}
                          >
                            {event.type}
                          </span>
                        )}
                        {event.source && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {event.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3 mb-4">
                    {event.date && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{formatDate(event.date)}</span>
                      </div>
                    )}

                    {event.time && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{formatTime(event.time)}</span>
                      </div>
                    )}

                    {event.venue && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">{event.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">{event.description}</p>
                  )}

                  {/* Missing Details Warning */}
                  {(!event.venue || !event.time || event.time === "TBD") && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
                      <p className="text-orange-800 dark:text-orange-200 text-sm">
                        ⚠️ Some details are missing - you can edit this event to add them
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCalendar(event)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Add to Calendar
                    </button>

                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {event.source_url && (
                      <button
                        onClick={() => handleViewSource(event)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="See source"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleHideEvent(event.id)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Hide event"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onSave={(updatedEvent) => {
              setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)))
              setEditingEvent(null)
            }}
          />
        )}

        {showAddSource && (
          <AddSourceModal
            onClose={() => setShowAddSource(false)}
            onSuccess={() => {
              setShowAddSource(false)
              handleRefresh()
            }}
          />
        )}
      </div>
    </div>
  )
}
