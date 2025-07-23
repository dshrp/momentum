"use client"

import { useState } from "react"
import {
  Users,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
} from "lucide-react"

const MomentumAdmin = () => {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock admin data
  const stats = {
    totalUsers: 47,
    activeUsers: 34,
    eventsDetected: 156,
    successRate: 87,
  }

  const recentActivity = [
    { type: "event_detected", user: "Sarah M.", details: "DJ set at Basement - via Instagram", time: "2 mins ago" },
    { type: "user_signup", user: "Mike Chen", details: "New user onboarded", time: "1 hour ago" },
    { type: "source_error", user: "Alex R.", details: "RA RSS feed failed", time: "2 hours ago" },
    { type: "event_detected", user: "Jordan K.", details: "Poetry reading - via Instagram", time: "3 hours ago" },
  ]

  const systemStatus = [
    { service: "Instagram Monitor", status: "operational", lastCheck: "10 mins ago" },
    { service: "RA RSS Feeds", status: "degraded", lastCheck: "1 hour ago" },
    { service: "Make.com Workflows", status: "operational", lastCheck: "2 mins ago" },
    { service: "Airtable Database", status: "operational", lastCheck: "1 min ago" },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "degraded":
      case "error":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "down":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                Total Users
              </p>
              <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                {stats.totalUsers}
              </p>
            </div>
            <Users className="w-8 h-8" style={{ color: "#1E40AF" }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                Active Users
              </p>
              <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                {stats.activeUsers}
              </p>
            </div>
            <Activity className="w-8 h-8" style={{ color: "#10B981" }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                Events Detected
              </p>
              <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                {stats.eventsDetected}
              </p>
            </div>
            <Calendar className="w-8 h-8" style={{ color: "#8B5CF6" }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#4A4A4A" }}>
                Success Rate
              </p>
              <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                {stats.successRate}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: "#F59E0B" }} />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
        <h3 className="text-lg font-bold mb-6" style={{ color: "#1A1A1A" }}>
          System Status
        </h3>
        <div className="space-y-4">
          {systemStatus.map((service, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <span className="font-semibold" style={{ color: "#1A1A1A" }}>
                  {service.service}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium capitalize" style={{ color: "#4A4A4A" }}>
                  {service.status}
                </span>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  Last check: {service.lastCheck}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6" style={{ border: "3px solid #1A1A1A" }}>
        <h3 className="text-lg font-bold mb-6" style={{ color: "#1A1A1A" }}>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: "#1E40AF" }} />
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "#1A1A1A" }}>
                  {activity.user}
                </p>
                <p className="text-sm" style={{ color: "#4A4A4A" }}>
                  {activity.details}
                </p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFCF5" }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                  Momentum Admin
                </h1>
                <p className="text-sm" style={{ color: "#4A4A4A" }}>
                  System management dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "white",
                  color: "#1A1A1A",
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Sync All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-1 mb-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                activeTab === tab.id ? "text-white" : "hover:opacity-70"
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? "#1E40AF" : "transparent",
                color: activeTab === tab.id ? "white" : "#1A1A1A",
                border: "2px solid #1A1A1A",
              }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && renderOverview()}
      </div>
    </div>
  )
}

export default MomentumAdmin
