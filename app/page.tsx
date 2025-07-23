"use client"

import dynamic from "next/dynamic"
import ErrorBoundary from "../src/components/ErrorBoundary"

const MomentumApp = dynamic(() => import("../src/components/MomentumDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FEFCF5" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-semibold" style={{ color: "#1A1A1A" }}>
          Loading Momentum...
        </p>
      </div>
    </div>
  ),
})

export default function Page() {
  return (
    <ErrorBoundary>
      <MomentumApp />
    </ErrorBoundary>
  )
}
