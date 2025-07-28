"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  Zap,
  RefreshCw,
  AlertTriangle,
  ExternalLinkIcon,
  Edit3,
  Eye,
  CheckCircle,
  Info,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react"
import { trackMomentumEvent } from "../../lib/analytics"
import EditEventModal from "./EditEventModal"
import AddSourceModal from "./AddSourceModal"

const MomentumApp = () => {
  const [mounted, setMounted] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("upcoming")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showAddSource, setShowAddSource] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, duplicatesRemoved: 0, userUpdated: 0 })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const [editSuccess, setEditSuccess] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Dark mode toggle function
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  // Initialize dark mode on mount
  useEffect(() => {
    setMounted(true)

    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark)

    setDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // ENHANCED: Fetch events using the new CLEAN API endpoint with aggressive cache busting
  const fetchEvents = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
        trackMomentumEvent.refreshEvents()
      } else {
        setLoading(true)
      }
      setError(null)
      console.log("🧹 Fetching CLEAN events from API with aggressive cache busting...")

      // SUPER aggressive cache busting
      const cacheBuster = Date.now() + Math.random().toString(36).substr(2, 9)

      // Clear browser cache first
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map((name) => caches.delete(name)))
          console.log("🗑️ Cleared browser caches:", cacheNames)
        } catch (err) {
          console.warn("⚠️ Could not clear browser caches:", err)
        }
      }

      const response = await fetch(`/api/events-clean?_=${cacheBuster}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          // Add random header to ensure uniqueness
          "X-Cache-Buster": cacheBuster,
        },
      })
      console.log("📡 Clean Events API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ details: "Network error" }))
        throw new Error(errorData.details || "Failed to fetch events")
      }

      const data = await response.json()
      console.log("✅ Clean events data received:", {
        totalEvents: data.events?.length || 0,
        hasStats: !!data.stats,
        duplicatesRemoved: data.stats?.duplicatesRemoved || 0,
        timestamp: data.timestamp,
        cacheBuster: data.cacheBuster,
      })

      // FIXED: Ensure events is always an array
      const eventsArray = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : []
      const statsData = data.stats || { total: 0, upcoming: 0, past: 0, duplicatesRemoved: 0, userUpdated: 0 }

      // Log Dylan events specifically for debugging
      const dylanEvents = eventsArray.filter((e) => e.title && e.title.toLowerCase().includes("dark ride"))
      console.log(
        "🎯 Dylan events in response:",
        dylanEvents.map((e) => ({
          id: e.id,
          title: e.title,
          userUpdated: e.userUpdated,
        })),
      )

      // Events are already processed and clean from the API
      setEvents(eventsArray)
      setStats(statsData)
      setLastUpdated(new Date())

      // Check if we're using mock data
      if (data.error) {
        setError(`${data.error}: ${data.details}`)
      }
    } catch (err) {
      setError(err.message)
      console.error("Error fetching clean events:", err)
      trackMomentumEvent.trackError(err.message, "dashboard")
      // Set empty array on error to prevent map errors
      setEvents([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // SUPER aggressive manual refresh function
  const handleManualRefresh = async () => {
    console.log("🔄 SUPER AGGRESSIVE refresh triggered - clearing ALL caches")

    // Clear service worker caches
    if ("serviceWorker" in navigator && "caches" in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
        console.log("🗑️ Cleared service worker caches:", cacheNames)
      } catch (err) {
        console.warn("⚠️ Could not clear service worker caches:", err)
      }
    }

    // Clear localStorage cache indicators
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("cache") || key.includes("events") || key.includes("momentum")) {
          localStorage.removeItem(key)
        }
      })
      console.log("🗑️ Cleared localStorage cache keys")
    } catch (err) {
      console.warn("⚠️ Could not clear localStorage:", err)
    }

    // Call cache clear endpoint
    try {
      await fetch("/api/debug/cache-clear", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      console.log("🗑️ Called server cache clear endpoint")
    } catch (err) {
      console.warn("⚠️ Could not call cache clear endpoint:", err)
    }

    // Wait a moment then fetch fresh data
    setTimeout(() => {
      fetchEvents(true) // Show refresh indicator
    }, 500)
  }

  // ENHANCED: Handle event update with better refresh logic
  const handleEventUpdate = async (updatedRecord) => {
    console.log("🎉 Event updated successfully, refreshing clean data...")
    setEditSuccess("Event updated successfully!")
    setTimeout(() => setEditSuccess(null), 3000)

    // Longer delay to ensure Airtable processes the update before we re-fetch clean data
    setTimeout(() => {
      console.log("🔄 Refreshing clean events after update...")
      handleManualRefresh() // Use super aggressive refresh
    }, 2000)
  }

  // Load events on component mount
  useEffect(() => {
    if (mounted) {
      fetchEvents()
    }
  }, [mounted])

  // ENHANCED: Reduced auto-refresh interval and better logging
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(
      () => {
        console.log("⏰ Auto-refresh triggered (2 minute interval for clean data)")
        fetchEvents(true) // Show refresh indicator for auto-refresh too
      },
      120 * 1000, // 2 minutes
    )
    return () => clearInterval(interval)
  }, [mounted])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest(".filter-dropdown")) {
        setShowFilterDropdown(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showFilterDropdown])

  // Don't render until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--momentum-cream))]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[hsl(var(--momentum-deep-blue))]" />
          <p className="font-semibold text-[hsl(var(--momentum-text-primary))]">Loading Momentum...</p>
        </div>
      </div>
    )
  }

  const sources = [
    {
      name: "Instagram",
      count: Array.isArray(events) ? events.filter((e) => e.source === "Instagram").length : 0,
      status: "connected",
    },
  ]

  // Main filter options (always visible)
  const mainFilterOptions = [
    { id: "upcoming", label: "Upcoming", count: stats.upcoming },
    { id: "past", label: "Past Events", count: stats.past },
    { id: "all", label: "All Events", count: stats.total },
  ]

  // Event type filters - ensure events is an array
  const eventTypeFilters = Array.from(
    new Set(
      Array.isArray(events) ? events.filter((event) => event.source === "Instagram").map((event) => event.type) : [],
    ),
  ).map((type) => ({
    id: type,
    label: type,
    count: Array.isArray(events) ? events.filter((e) => e.type === type && e.source === "Instagram").length : 0,
    category: "Event Type",
  }))

  // Location filters - ensure events is an array
  const locationFilters = Array.from(
    new Set(
      Array.isArray(events)
        ? events
            .map((event) => {
              const location = event.location || ""
              return location.trim()
            })
            .filter(Boolean)
        : [],
    ),
  )
    .sort()
    .map((location) => ({
      id: `location:${location}`,
      label: location,
      count: Array.isArray(events) ? events.filter((e) => e.location === location).length : 0,
      category: "Location",
    }))

  // All dropdown options (event types + locations)
  const dropdownOptions = [...eventTypeFilters, ...locationFilters]

  // Get current filter display info
  const getCurrentFilterInfo = () => {
    const mainFilter = mainFilterOptions.find((f) => f.id === selectedFilter)
    if (mainFilter) return mainFilter

    const dropdownFilter = dropdownOptions.find((f) => f.id === selectedFilter)
    if (dropdownFilter) {
      return {
        ...dropdownFilter,
        label: dropdownFilter.category === "Location" ? `📍 ${dropdownFilter.label}` : dropdownFilter.label,
      }
    }

    return { id: selectedFilter, label: selectedFilter, count: 0 }
  }

  // SIMPLIFIED: Filtering and sorting (events are already clean from API) - ensure events is an array
  const filteredEvents = Array.isArray(events)
    ? events
        .filter((event) => {
          if (selectedFilter === "upcoming") {
            return event.isUpcoming
          } else if (selectedFilter === "past") {
            return !event.isUpcoming
          } else if (selectedFilter === "all") {
            return true
          } else if (selectedFilter.startsWith("location:")) {
            const targetLocation = selectedFilter.replace("location:", "")
            return event.location === targetLocation
          } else {
            return event.type === selectedFilter
          }
        })
        .sort((a, b) => {
          if (a.isUpcoming && b.isUpcoming) {
            // Both upcoming - sort by date ascending (soonest first)
            if (!a.date && !b.date) return 0
            if (!a.date) return 1
            if (!b.date) return -1
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            return dateA - dateB
          } else if (!a.isUpcoming && !b.isUpcoming) {
            // Both past - sort by date descending (most recent first)
            if (!a.date && !b.date) return 0
            if (!a.date) return 1
            if (!b.date) return -1
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            return dateB - dateA
          } else {
            // Mixed - upcoming events always come first
            return a.isUpcoming ? -1 : 1
          }
        })
    : []

  const addToCalendar = (event) => {
    if (!event.date) {
      alert("This event doesn't have a date set yet. Check the original post for timing details!")
      return
    }

    try {
      // Use the exact date from Airtable (YYYY-MM-DD format)
      const eventDate = event.date

      // Parse time - handle various formats
      let startTime = "0000"
      let endTime = "2359"

      if (event.time && event.time !== "Time TBD") {
        // Try to parse common time formats
        const timeStr = event.time.toString().toLowerCase()

        // Handle formats like "8:00 PM", "20:00", "8 PM", etc.
        const timeMatch = timeStr.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?/)
        if (timeMatch) {
          let hours = Number.parseInt(timeMatch[1])
          const minutes = Number.parseInt(timeMatch[2] || "0")
          const ampm = timeMatch[3]

          // Convert to 24-hour format
          if (ampm === "pm" && hours !== 12) {
            hours += 12
          } else if (ampm === "am" && hours === 12) {
            hours = 0
          }

          startTime = hours.toString().padStart(2, "0") + minutes.toString().padStart(2, "0")

          // End time is 2 hours later (or end of day)
          let endHours = hours + 2
          if (endHours >= 24) endHours = 23
          endTime = endHours.toString().padStart(2, "0") + minutes.toString().padStart(2, "0")
        }
      }

      // Format dates for Google Calendar (YYYYMMDDTHHMMSS)
      const startDateTime = eventDate.replace(/-/g, "") + "T" + startTime + "00"
      const endDateTime = eventDate.replace(/-/g, "") + "T" + endTime + "00"

      console.log("Calendar link data:", {
        originalDate: event.date,
        originalTime: event.time,
        startDateTime,
        endDateTime,
      })

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent((event.venue || "") + ", " + (event.location || ""))}`

      window.open(calendarUrl, "_blank")
      trackMomentumEvent.addToCalendar(event.id)
    } catch (err) {
      console.error("Error creating calendar link:", err)
      alert("Error creating calendar link. Please try again.")
    }
  }

  // Get some example posts for the empty state
  const getExamplePosts = () => {
    try {
      const pastEvents = Array.isArray(events)
        ? events.filter((e) => !e.isUpcoming && e.sourceUrl && e.sourceUrl !== "#").slice(0, 3)
        : []
      return pastEvents
    } catch (err) {
      console.error("Error getting example posts:", err)
      return []
    }
  }

  const currentFilterInfo = getCurrentFilterInfo()

  return (
    <div className="min-h-screen bg-[hsl(var(--momentum-cream))]">
      {/* Header */}
      <div className="bg-[hsl(var(--momentum-card-bg))] shadow-sm border-b-[3px] border-[hsl(var(--momentum-border))]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--momentum-text-primary))]">Momentum</h1>
                <p className="text-sm text-[hsl(var(--momentum-text-secondary))]">
                  Never miss your friends' events again
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{
                  border: "2px solid hsl(var(--momentum-border))",
                  backgroundColor: "hsl(var(--momentum-card-bg))",
                  color: "hsl(var(--momentum-text-primary))",
                }}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>

              {/* SUPER Enhanced Refresh Button */}
              <button
                onClick={handleManualRefresh}
                disabled={refreshing || loading}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity disabled:opacity-50"
                style={{
                  border: "2px solid hsl(var(--momentum-border))",
                  backgroundColor: refreshing ? "hsl(var(--momentum-deep-blue) / 0.1)" : "hsl(var(--momentum-card-bg))",
                  color: refreshing ? "hsl(var(--momentum-deep-blue))" : "hsl(var(--momentum-text-primary))",
                }}
                title="SUPER refresh - clears all caches and gets fresh data from Airtable"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
                <span className="sm:hidden">{refreshing ? "..." : "↻"}</span>
              </button>

              <button
                onClick={() => {
                  trackMomentumEvent.visitFollowing()
                  window.location.href = "/following"
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: "hsl(var(--momentum-card-bg))",
                  color: "hsl(var(--momentum-text-primary))",
                  border: "2px solid hsl(var(--momentum-border))",
                }}
              >
                <Users className="w-5 h-5" />
                Following
              </button>
              {/* Add Source Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAddSource(true)
                    trackMomentumEvent.addSource("manual")
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity relative"
                  style={{
                    backgroundColor: "hsl(var(--momentum-deep-blue))",
                    border: "2px solid hsl(var(--momentum-border))",
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add Source
                </button>
              </div>
              {/* About Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    trackMomentumEvent.visitAbout()
                    window.location.href = "/about"
                  }}
                  className="w-full sm:w-auto p-3 rounded-xl transition-colors relative flex items-center justify-center"
                  style={{
                    color: "hsl(var(--momentum-text-secondary))",
                    border: "2px solid hsl(var(--momentum-border))",
                    backgroundColor: "hsl(var(--momentum-card-bg))",
                  }}
                >
                  <Info className="w-5 h-5" />
                  <span className="ml-2 sm:hidden">About</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Enhanced Stats Banner */}
        {(stats.duplicatesRemoved > 0 || stats.userUpdated > 0) && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center gap-3"
            style={{
              border: "2px solid hsl(var(--momentum-border))",
              backgroundColor: "hsl(var(--momentum-deep-blue) / 0.1)",
            }}
          >
            <Zap className="w-5 h-5 text-[hsl(var(--momentum-deep-blue))]" />
            <div>
              <p className="font-semibold text-[hsl(var(--momentum-text-primary))]">
                Found {stats.total} unique events
                {stats.duplicatesRemoved > 0 && ` (${stats.duplicatesRemoved} duplicates removed)`}
              </p>
              <p className="text-sm text-[hsl(var(--momentum-text-secondary))]">
                {stats.upcoming} upcoming • {stats.past} past events
                {stats.userUpdated > 0 && ` • ${stats.userUpdated} user-updated`}
                {/* Auto-refresh indicator */}
                <span className="ml-2 text-xs opacity-70">• Clean data refreshes every 2 minutes</span>
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {editSuccess && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center gap-3"
            style={{
              border: "2px solid #16A34A",
              backgroundColor: "#DCFCE7",
            }}
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-800">{editSuccess}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-6 shadow-sm border-[3px] border-[hsl(var(--momentum-border))]">
              <h3 className="font-bold mb-6 text-[hsl(var(--momentum-text-primary))]">Filter Events</h3>

              {/* Main Filter Buttons */}
              <div className="space-y-3 mb-6">
                {mainFilterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFilter(option.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                      selectedFilter === option.id ? "text-white" : "hover:opacity-70"
                    }`}
                    style={{
                      backgroundColor: selectedFilter === option.id ? "hsl(var(--momentum-deep-blue))" : "transparent",
                      color: selectedFilter === option.id ? "white" : "hsl(var(--momentum-text-primary))",
                      border: "2px solid hsl(var(--momentum-border))",
                    }}
                  >
                    {option.label}
                    <span className="float-right text-sm opacity-70">{option.count}</span>
                  </button>
                ))}
              </div>

              {/* Filter Dropdown */}
              {dropdownOptions.length > 0 && (
                <div className="mb-6">
                  <div className="relative filter-dropdown">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-between ${
                        !mainFilterOptions.find((f) => f.id === selectedFilter) ? "text-white" : "hover:opacity-70"
                      }`}
                      style={{
                        backgroundColor: !mainFilterOptions.find((f) => f.id === selectedFilter)
                          ? "hsl(var(--momentum-deep-blue))"
                          : "transparent",
                        color: !mainFilterOptions.find((f) => f.id === selectedFilter)
                          ? "white"
                          : "hsl(var(--momentum-text-primary))",
                        border: "2px solid hsl(var(--momentum-border))",
                      }}
                    >
                      <span className="truncate">
                        {!mainFilterOptions.find((f) => f.id === selectedFilter)
                          ? currentFilterInfo.label
                          : "More Filters"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--momentum-card-bg))] rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto border-[2px] border-[hsl(var(--momentum-border))]">
                        {/* Event Types */}
                        {eventTypeFilters.length > 0 && (
                          <>
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-[hsl(var(--momentum-text-secondary))] bg-[hsl(var(--momentum-cream))]">
                              Event Types
                            </div>
                            {eventTypeFilters.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => {
                                  setSelectedFilter(option.id)
                                  setShowFilterDropdown(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--momentum-cream))] transition-colors flex items-center justify-between text-[hsl(var(--momentum-text-primary))]"
                              >
                                <span>{option.label}</span>
                                <span className="text-sm opacity-70">{option.count}</span>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Locations */}
                        {locationFilters.length > 0 && (
                          <>
                            {eventTypeFilters.length > 0 && (
                              <div className="border-t border-[hsl(var(--momentum-border))]" />
                            )}
                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-[hsl(var(--momentum-text-secondary))] bg-[hsl(var(--momentum-cream))]">
                              Locations
                            </div>
                            {locationFilters.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => {
                                  setSelectedFilter(option.id)
                                  setShowFilterDropdown(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--momentum-cream))] transition-colors flex items-center justify-between text-[hsl(var(--momentum-text-primary))]"
                              >
                                <span>📍 {option.label}</span>
                                <span className="text-sm opacity-70">{option.count}</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <h3 className="font-bold mb-6 text-[hsl(var(--momentum-text-primary))]">Connected Sources</h3>
              <div className="space-y-4">
                {sources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <span className="font-medium text-[hsl(var(--momentum-text-primary))]">{source.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[hsl(var(--momentum-text-secondary))]">
                        {source.count}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          source.status === "connected" ? "bg-green-500" : "bg-yellow-500"
                        } border border-[hsl(var(--momentum-border))]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[hsl(var(--momentum-text-primary))]">
                {selectedFilter === "upcoming"
                  ? "Upcoming Events"
                  : selectedFilter === "past"
                    ? "Past Events"
                    : selectedFilter === "all"
                      ? "All Events"
                      : selectedFilter.startsWith("location:")
                        ? `Events in ${selectedFilter.replace("location:", "")}`
                        : selectedFilter}{" "}
                ({filteredEvents.length})
              </h2>
              <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--momentum-text-secondary))]">
                <Calendar className="w-4 h-4" />
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
                {refreshing && (
                  <span className="flex items-center gap-1 text-[hsl(var(--momentum-deep-blue))]">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>
            </div>

            {/* Error State - Updated to remove backend tech mentions */}
            {error && (
              <div
                className="p-4 rounded-xl mb-6"
                style={{
                  border: "2px solid #F59E0B",
                  backgroundColor: "#FEF3C7",
                }}
              >
                <p className="font-semibold text-amber-800">Using Demo Data</p>
                <p className="text-sm text-amber-700">
                  We're still setting up your personalized event detection. For now, you're seeing sample events.
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  The app is working perfectly - we're just connecting the final pieces behind the scenes!
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[hsl(var(--momentum-deep-blue))]" />
                <p className="font-semibold text-[hsl(var(--momentum-text-primary))]">
                  Finding your friends' events...
                </p>
              </div>
            )}

            {/* Empty State for Upcoming Events */}
            {!loading && selectedFilter === "upcoming" && filteredEvents.length === 0 && !error && (
              <div className="text-center py-12 rounded-xl bg-[hsl(var(--momentum-card-bg))] border-[3px] border-[hsl(var(--momentum-border))]">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--momentum-text-secondary))]" />
                <h3 className="text-lg font-bold mb-2 text-[hsl(var(--momentum-text-primary))]">
                  No upcoming events found
                </h3>
                <p className="mb-4 text-[hsl(var(--momentum-text-secondary))]">
                  But double check a few of your friends' feeds just in case!
                </p>

                {getExamplePosts().length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">
                      Here are some recent posts we found:
                    </p>
                    <div className="flex gap-3 justify-center">
                      {getExamplePosts().map((event, index) => (
                        <a
                          key={index}
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity"
                          style={{
                            border: "2px solid hsl(var(--momentum-border))",
                            backgroundColor: "hsl(var(--momentum-cream))",
                            color: "hsl(var(--momentum-text-primary))",
                          }}
                          onClick={() => trackMomentumEvent.viewEvent(event.id)}
                        >
                          <ExternalLinkIcon className="w-4 h-4" />
                          {event.friend}'s post
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Empty State */}
            {!loading && filteredEvents.length === 0 && selectedFilter !== "upcoming" && !error && (
              <div className="text-center py-12 rounded-xl bg-[hsl(var(--momentum-card-bg))] border-[3px] border-[hsl(var(--momentum-border))]">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--momentum-text-secondary))]" />
                <h3 className="text-lg font-bold mb-2 text-[hsl(var(--momentum-text-primary))]">
                  No {selectedFilter} events found
                </h3>
                <p className="text-[hsl(var(--momentum-text-secondary))]">
                  Try selecting a different filter or check back later.
                </p>
              </div>
            )}

            {/* Events List */}
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border-[3px] border-[hsl(var(--momentum-border))]"
                >
                  {/* Mobile: Stack vertically, Desktop: Side by side */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {" "}
                      {/* min-w-0 prevents flex item from overflowing */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="font-bold text-lg break-words text-[hsl(var(--momentum-text-primary))]">
                          {event.title || "Untitled Event"}
                          {event.missingData?.title && (
                            <span className="text-sm font-normal text-orange-600 ml-2">(Title missing)</span>
                          )}
                        </h3>
                        <span
                          className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: "hsl(var(--momentum-cream))",
                            color: "hsl(var(--momentum-text-primary))",
                            border: "2px solid hsl(var(--momentum-border))",
                          }}
                        >
                          {event.type || "Event"}
                        </span>
                        <span
                          className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: "hsl(var(--momentum-card-bg))",
                            color: "hsl(var(--momentum-text-secondary))",
                            border: "2px solid hsl(var(--momentum-text-secondary))",
                          }}
                        >
                          {event.source || "Instagram"}
                        </span>
                        {!event.isUpcoming && (
                          <span
                            className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap"
                            style={{
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              border: "2px solid #F59E0B",
                            }}
                          >
                            Past Event
                          </span>
                        )}
                        {event.userUpdated && (
                          <span
                            className="px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap"
                            style={{
                              backgroundColor: "#DCFCE7",
                              color: "#166534",
                              border: "2px solid #16A34A",
                            }}
                          >
                            User Updated
                          </span>
                        )}
                      </div>
                      <p className="mb-4 font-medium break-words text-[hsl(var(--momentum-text-secondary))]">
                        {event.description || "No description available"}
                      </p>
                      {/* Mobile: Stack info vertically, Desktop: Horizontal */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm font-semibold text-[hsl(var(--momentum-text-secondary))]">
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{event.friend || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {event.date ? (
                              new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            ) : (
                              <span className="text-orange-600">Date TBD</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className={`truncate ${event.missingData?.time ? "text-orange-600" : ""}`}>
                            {event.time || "Time TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className={`truncate ${event.missingData?.venue ? "text-orange-600" : ""}`}>
                            {event.venue || "TBD"}, {event.location || "TBD"}
                          </span>
                        </div>
                      </div>
                      {/* Missing Data Warning */}
                      {event.missingData &&
                        (event.missingData.title ||
                          event.missingData.time ||
                          event.missingData.venue ||
                          event.missingData.date) && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-orange-600">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="break-words">
                              Some details are missing - you can edit this event to add them
                            </span>
                          </div>
                        )}
                      {/* User Update Info */}
                      {event.userUpdated && event.lastUserUpdate && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-green-600">
                          <Edit3 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="break-words">
                            Updated by user on {new Date(event.lastUserUpdate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Vertical on desktop, horizontal on mobile */}
                    <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                      {/* See Source Button */}
                      {event.sourceUrl && event.sourceUrl !== "#" && event.sourceUrl.startsWith("http") ? (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity"
                          style={{
                            color: "hsl(var(--momentum-text-secondary))",
                            border: "2px solid hsl(var(--momentum-border))",
                            backgroundColor: "hsl(var(--momentum-card-bg))",
                          }}
                          title="View original post"
                          onClick={() => trackMomentumEvent.viewEvent(event.id)}
                        >
                          <Eye className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">See Source</span>
                          <span className="sm:hidden">Source</span>
                        </a>
                      ) : (
                        <div
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium opacity-50"
                          style={{
                            color: "#9CA3AF",
                            border: "2px solid #D1D5DB",
                            backgroundColor: "#F9FAFB",
                          }}
                          title="Source URL not available"
                        >
                          <Eye className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">No Source</span>
                          <span className="sm:hidden">No URL</span>
                        </div>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingEvent(event)
                          trackMomentumEvent.editEvent(event.id)
                        }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity"
                        style={{
                          color: "hsl(var(--momentum-text-primary))",
                          border: "2px solid hsl(var(--momentum-border))",
                          backgroundColor: "hsl(var(--momentum-cream))",
                        }}
                        title="Edit event details"
                      >
                        <Edit3 className="w-4 h-4 flex-shrink-0" />
                        <span>Edit</span>
                      </button>

                      {/* Add to Calendar Button */}
                      <button
                        onClick={() => addToCalendar(event)}
                        disabled={!event.date}
                        className="flex-1 lg:flex-none px-3 py-2 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: event.date ? "hsl(var(--momentum-deep-blue))" : "#9CA3AF",
                          border: "2px solid hsl(var(--momentum-border))",
                        }}
                      >
                        <span className="hidden sm:inline">{event.date ? "Add to Calendar" : "No Date Set"}</span>
                        <span className="sm:hidden">{event.date ? "Calendar" : "No Date"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleEventUpdate}
        />
      )}

      {/* Add Source Modal */}
      {showAddSource && (
        <AddSourceModal
          isOpen={showAddSource}
          onClose={() => setShowAddSource(false)}
          onSuccess={(result) => {
            console.log("Source added:", result)
            // Refresh events to show new data
            handleManualRefresh() // Use super aggressive refresh
          }}
        />
      )}
    </div>
  )
}

export default MomentumApp
