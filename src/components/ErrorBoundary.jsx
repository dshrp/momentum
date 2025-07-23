"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FEFCF5" }}>
          <div className="bg-white rounded-xl p-8 max-w-md text-center" style={{ border: "3px solid #DC2626" }}>
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
              Something went wrong
            </h2>
            <p className="mb-6" style={{ color: "#4A4A4A" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity mx-auto"
              style={{ backgroundColor: "#DC2626" }}
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
