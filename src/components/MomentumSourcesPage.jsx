"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Instagram,
  Calendar,
  TrendingUp,
  X,
  Eye,
} from "lucide-react"
import AddSourceModal from "./AddSourceModal"

const MomentumSourcesPage = () => {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddSource, setShowAddSource] = useState(false)
  const [editingSource, setEditingSource] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const [showManualReviewInfo, setShowManualReviewInfo] = useState(false)

  // Fetch sources from API
  const fetchSources = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/sources")

      if (!response.ok) {
        throw new Error("Failed to fetch sources")
      }

      const data = await response.json()
      setSources(data.sources || [])
      setLastUpdated(new Date())

      if (data.mockMode) {
        setError("Using demo data - connect your Airtable to see real sources")
      }
    } catch (err) {
      setError(err.message)
      console.error("Error fetching sources:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  // Get status for a source based on last activity - UPDATED LOGIC
  const getSourceStatus = (source) => {
    // If never checked, it requires manual review
    if (!source.lastChecked) {
      return {
        status: "manual_review",
        label: "Requires Manual Review",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        description: "Instagram RSS feeds are unreliable - manual check recommended",
      }
    }

    const lastCheck = new Date(source.lastChecked)
    const hoursAgo = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60)

    if (hoursAgo > 48) {
      return {
        status: "stale",
        label: "Check overdue",
        color: "text-red-600",
        bgColor: "bg-red-100",
        description: "Last check was more than 48 hours ago",
      }
    }

    if (source.eventsFound > 0) {
      return {
        status: "active",
        label: "Finding events",
        color: "text-green-600",
        bgColor: "bg-green-100",
        description: "Successfully finding events from this account",
      }
    }

    return {
      status: "quiet",
      label: "No recent events",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Checked recently but no events found",
    }
  }

  // Get status icon - UPDATED
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "manual_review":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case "stale":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "quiet":
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  // Calculate overall stats - UPDATED
  const stats = sources.reduce(
    (acc, platform) => {
      platform.sources?.forEach((source) => {
        acc.total++
        acc.totalEvents += source.eventsFound || 0
        const status = getSourceStatus(source).status
        acc.statusCounts[status] = (acc.statusCounts[status] || 0) + 1
      })
      return acc
    },
    { total: 0, totalEvents: 0, statusCounts: {} },
  )

  // Manual Review Info Modal Component
  const ManualReviewInfoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: "3px solid #1A1A1A" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: "#1A1A1A" }}>
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Manual Review Required
          </h3>
          <button
            onClick={() => setShowManualReviewInfo(false)}
            className="p-2 rounded-xl hover:opacity-70 transition-opacity"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "white",
              color: "#4A4A4A",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Main Issue */}
          <div
            className="p-6 rounded-xl"
            style={{
              border: "2px solid #F59E0B",
              backgroundColor: "#FEF3C7",
            }}
          >
            <h4 className="font-bold text-amber-800 mb-3">Why Instagram RSS Feeds Are Unreliable</h4>
            <div className="space-y-3 text-sm text-amber-700">
              <p>
                <strong>Instagram has systematically broken RSS access since 2018:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>API limits reduced from 5,000 to 200 calls per hour (2018)</li>
                <li>Instagram Basic Display API shut down entirely (December 2024)</li>
                <li>Third-party RSS services like RSS-Bridge and RSSHub frequently break</li>
                <li>Instagram actively blocks automated access to protect user privacy</li>
              </ul>
            </div>
          </div>

          {/* What This Means */}
          <div>
            <h4 className="font-bold mb-3" style={{ color: "#1A1A1A" }}>
              What "Requires Manual Review" Means
            </h4>
            <div className="space-y-3 text-sm" style={{ color: "#4A4A4A" }}>
              <p>When you see this status, it means:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>We haven't been able to automatically check this account</strong> - likely due to Instagram's
                  restrictions
                </li>
                <li>
                  <strong>The RSS feed may be broken or blocked</strong> - this affects most Instagram monitoring tools
                </li>
                <li>
                  <strong>Manual checking is more reliable</strong> - visiting the account directly always works
                </li>
              </ul>
            </div>
          </div>

          {/* Possible Reasons */}
          <div>
            <h4 className="font-bold mb-3" style={{ color: "#1A1A1A" }}>
              Possible Reasons for Empty Feeds
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-xl"
                style={{
                  border: "2px solid #DC2626",
                  backgroundColor: "#FEF2F2",
                }}
              >
                <h5 className="font-semibold text-red-800 mb-2">Technical Issues</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• RSS service is down</li>
                  <li>• Instagram blocked the service</li>
                  <li>• Rate limits exceeded</li>
                  <li>• Account privacy changes</li>
                </ul>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{
                  border: "2px solid #1E40AF",
                  backgroundColor: "#F0F9FF",
                }}
              >
                <h5 className="font-semibold text-blue-800 mb-2">Account Issues</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Account went private</li>
                  <li>• Username changed</li>
                  <li>• Account deleted/suspended</li>
                  <li>• No recent posts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div
            className="p-6 rounded-xl"
            style={{
              border: "2px solid #16A34A",
              backgroundColor: "#DCFCE7",
            }}
          >
            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Recommended Action
            </h4>
            <div className="space-y-3 text-sm text-green-700">
              <p>
                <strong>Click the Instagram button</strong> next to any "Manual Review" account to visit their profile
                directly.
              </p>
              <p>This will let you:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>See their latest posts and stories</li>
                <li>Check for any recent event announcements</li>
                <li>Verify the account is still active and public</li>
                <li>Manually spot events that automated tools might miss</li>
              </ul>
              <p className="font-semibold">
                💡 Manual checking is often more reliable than automated RSS feeds for Instagram!
              </p>
            </div>
          </div>

          {/* Future Plans */}
          <div
            className="p-4 rounded-xl"
            style={{
              border: "2px solid #8B5CF6",
              backgroundColor: "#F3E8FF",
            }}
          >
            <h4 className="font-bold text-purple-800 mb-2">Future Improvements</h4>
            <p className="text-sm text-purple-700">
              We're exploring alternative approaches like browser extensions and direct integrations to work around
              Instagram's limitations. For now, the manual approach ensures you don't miss important events!
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={() => setShowManualReviewInfo(false)}
            className="px-8 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "#1E40AF",
              border: "2px solid #1A1A1A",
            }}
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFCF5" }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                  Following
                </h1>
                <p className="text-sm" style={{ color: "#4A4A4A" }}>
                  Manage your friends' accounts and monitoring status
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={fetchSources}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity disabled:opacity-50"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "white",
                  color: "#1A1A1A",
                }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddSource(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1E40AF", border: "2px solid #1A1A1A" }}
              >
                <Plus className="w-5 h-5" />
                Add Friend
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Overview - UPDATED */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                  Total Friends
                </p>
                <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                  {stats.total}
                </p>
              </div>
              <Users className="w-8 h-8" style={{ color: "#1E40AF" }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                  Events Found
                </p>
                <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                  {stats.totalEvents}
                </p>
              </div>
              <Calendar className="w-8 h-8" style={{ color: "#10B981" }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                  Manual Review
                </p>
                <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                  {stats.statusCounts.manual_review || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8" style={{ color: "#F59E0B" }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                  Active Sources
                </p>
                <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                  {stats.statusCounts.active || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: "#8B5CF6" }} />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              border: "2px solid #F59E0B",
              backgroundColor: "#FEF3C7",
            }}
          >
            <p className="font-semibold text-amber-800">Connection Issue</p>
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
            Your Friends ({stats.total})
          </h2>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#4A4A4A" }}>
            <Clock className="w-4 h-4" />
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
          </div>
        </div>

        {/* Sources List */}
        {loading && sources.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#1E40AF" }} />
            <p className="font-semibold" style={{ color: "#1A1A1A" }}>
              Loading your friends...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sources.map((platform) => (
              <div key={platform.name} className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
                <div className="flex items-center gap-3 mb-6">
                  <Instagram className="w-6 h-6" style={{ color: "#E1306C" }} />
                  <h3 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
                    {platform.name} ({platform.sources?.length || 0})
                  </h3>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      platform.status === "connected" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    style={{ border: "1px solid #1A1A1A" }}
                  />
                </div>

                {platform.sources && platform.sources.length > 0 ? (
                  <div className="space-y-4">
                    {platform.sources.map((source) => {
                      const statusInfo = getSourceStatus(source)
                      return (
                        <div
                          key={source.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl"
                          style={{ border: "2px solid #1A1A1A", backgroundColor: "#FEFCF5" }}
                        >
                          {/* Main Info Section */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {getStatusIcon(statusInfo.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h4 className="font-bold" style={{ color: "#1A1A1A" }}>
                                  {source.friendName}
                                </h4>
                                <span className="text-sm font-medium" style={{ color: "#4A4A4A" }}>
                                  @{source.username}
                                </span>
                                {/* UPDATED STATUS BADGE - with click handler for manual review */}
                                {statusInfo.status === "manual_review" ? (
                                  <button
                                    onClick={() => setShowManualReviewInfo(true)}
                                    className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap hover:opacity-80 transition-opacity ${statusInfo.color} ${statusInfo.bgColor}`}
                                    title="Click to learn more about manual review"
                                  >
                                    {statusInfo.label} ℹ️
                                  </button>
                                ) : (
                                  <span
                                    className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusInfo.color} ${statusInfo.bgColor}`}
                                  >
                                    {statusInfo.label}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "#4A4A4A" }}>
                                <span>{source.eventsFound || 0} events found</span>
                                {source.lastChecked ? (
                                  <span>Last checked: {new Date(source.lastChecked).toLocaleDateString()}</span>
                                ) : (
                                  <span className="text-orange-600 font-medium">Never checked automatically</span>
                                )}
                                {source.dateAdded && (
                                  <span>Added: {new Date(source.dateAdded).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Instagram Link Button - ENHANCED for manual review */}
                          {source.username && (
                            <div className="flex justify-end sm:justify-start">
                              <a
                                href={`https://instagram.com/${source.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity ${
                                  statusInfo.status === "manual_review" ? "ring-2 ring-orange-400 ring-opacity-50" : ""
                                }`}
                                style={{
                                  color: "#E1306C",
                                  border: "2px solid #E1306C",
                                  backgroundColor: statusInfo.status === "manual_review" ? "#FEF3C7" : "white",
                                }}
                                title={
                                  statusInfo.status === "manual_review"
                                    ? "Manual check recommended - click to view Instagram profile"
                                    : "View Instagram profile"
                                }
                              >
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">
                                  {statusInfo.status === "manual_review" ? "Check Manually" : `@${source.username}`}
                                </span>
                                <span className="sm:hidden">
                                  {statusInfo.status === "manual_review" ? "Check" : "View"}
                                </span>
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "#4A4A4A" }} />
                    <p className="font-semibold mb-2" style={{ color: "#1A1A1A" }}>
                      No {platform.name} friends yet
                    </p>
                    <p className="text-sm mb-4" style={{ color: "#4A4A4A" }}>
                      Add your first friend to start tracking their events
                    </p>
                    <button
                      onClick={() => setShowAddSource(true)}
                      className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#1E40AF", border: "2px solid #1A1A1A" }}
                    >
                      Add Friend
                    </button>
                  </div>
                )}
              </div>
            ))}

            {sources.length === 0 && !loading && (
              <div
                className="text-center py-12 rounded-xl"
                style={{
                  border: "3px solid #1A1A1A",
                  backgroundColor: "white",
                }}
              >
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "#4A4A4A" }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  No friends added yet
                </h3>
                <p className="mb-6" style={{ color: "#4A4A4A" }}>
                  Start by adding your friends' Instagram accounts to track their events
                </p>
                <button
                  onClick={() => setShowAddSource(true)}
                  className="px-8 py-4 text-white rounded-xl text-lg font-bold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#1E40AF", border: "2px solid #1A1A1A" }}
                >
                  Add Your First Friend
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Source Modal */}
      {showAddSource && (
        <AddSourceModal
          isOpen={showAddSource}
          onClose={() => setShowAddSource(false)}
          onSuccess={(result) => {
            console.log("Source added:", result)
            fetchSources() // Refresh the sources list
          }}
        />
      )}

      {/* Manual Review Info Modal */}
      {showManualReviewInfo && <ManualReviewInfoModal />}
    </div>
  )
}

export default MomentumSourcesPage
