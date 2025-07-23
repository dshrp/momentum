"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, Zap, Instagram, Music, Plus, Trash2, Eye, EyeOff } from "lucide-react"

const MomentumOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    instagramAccounts: [""],
    raArtists: [""],
  })
  const [showPassword, setShowPassword] = useState(false)

  const totalSteps = 3

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const updateArrayItem = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Welcome to Momentum
              </h2>
              <p className="text-lg" style={{ color: "#4A4A4A" }}>
                Never miss your friends' events again. Track Instagram posts and Resident Advisor gigs automatically!
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#FEFCF5",
                    color: "#1A1A1A",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#FEFCF5",
                    color: "#1A1A1A",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full px-4 py-3 pr-12 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    style={{
                      border: "2px solid #1A1A1A",
                      backgroundColor: "#FEFCF5",
                      color: "#1A1A1A",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: "#4A4A4A" }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Instagram className="w-12 h-12 mx-auto mb-4" style={{ color: "#1E40AF" }} />
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Add Instagram Accounts
              </h2>
              <p className="text-lg" style={{ color: "#4A4A4A" }}>
                Which friends' Instagram accounts should we monitor for events?
              </p>
            </div>

            <div className="space-y-4">
              {formData.instagramAccounts.map((account, index) => (
                <div key={index} className="flex gap-3">
                  <div className="relative flex-1">
                    <span
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 font-bold"
                      style={{ color: "#4A4A4A" }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      value={account}
                      onChange={(e) => updateArrayItem("instagramAccounts", index, e.target.value)}
                      placeholder="friendsusername"
                      className="w-full pl-8 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{
                        border: "2px solid #1A1A1A",
                        backgroundColor: "#FEFCF5",
                        color: "#1A1A1A",
                      }}
                    />
                  </div>
                  {formData.instagramAccounts.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("instagramAccounts", index)}
                      className="p-3 rounded-xl hover:opacity-70 transition-opacity"
                      style={{
                        border: "2px solid #1A1A1A",
                        backgroundColor: "white",
                        color: "#4A4A4A",
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem("instagramAccounts")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "white",
                  color: "#1A1A1A",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Another Account
              </button>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: "#FEF3C7",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "#92400E" }}>
                💡 <strong>Tip:</strong> Instagram monitoring works best for public accounts. We'll scan posts and
                stories for event keywords like dates, venues, and "tonight."
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Music className="w-12 h-12 mx-auto mb-4" style={{ color: "#1E40AF" }} />
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Resident Advisor Artists
              </h2>
              <p className="text-lg" style={{ color: "#4A4A4A" }}>
                Add your friends' RA artist pages to track their gigs
              </p>
            </div>

            <div className="space-y-4">
              {formData.raArtists.map((artist, index) => (
                <div key={index} className="flex gap-3">
                  <div className="relative flex-1">
                    <span
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm font-medium"
                      style={{ color: "#4A4A4A" }}
                    >
                      ra.co/dj/
                    </span>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => updateArrayItem("raArtists", index, e.target.value)}
                      placeholder="artist-name"
                      className="w-full pl-20 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{
                        border: "2px solid #1A1A1A",
                        backgroundColor: "#FEFCF5",
                        color: "#1A1A1A",
                      }}
                    />
                  </div>
                  {formData.raArtists.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("raArtists", index)}
                      className="p-3 rounded-xl hover:opacity-70 transition-opacity"
                      style={{
                        border: "2px solid #1A1A1A",
                        backgroundColor: "white",
                        color: "#4A4A4A",
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem("raArtists")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "white",
                  color: "#1A1A1A",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Another Artist
              </button>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: "#F0F9FF",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "#1E40AF" }}>
                🎵 <strong>How it works:</strong> We'll monitor RSS feeds from these artist pages to catch new gig
                announcements automatically.
              </p>
            </div>

            <div
              className="p-6 rounded-xl text-center"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: "#F0FDF4",
              }}
            >
              <h3 className="font-bold text-lg mb-2" style={{ color: "#1A1A1A" }}>
                🎉 You're All Set!
              </h3>
              <p className="text-sm" style={{ color: "#4A4A4A" }}>
                Momentum will start monitoring your sources and collecting events. You'll receive an email when your
                dashboard is ready!
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FEFCF5" }}>
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium" style={{ color: "#4A4A4A" }}>
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: "white", border: "1px solid #1A1A1A" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(currentStep / totalSteps) * 100}%`,
                backgroundColor: "#1E40AF",
              }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: "3px solid #1A1A1A" }}>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:opacity-70 transition-opacity"
                style={{
                  border: "2px solid #1A1A1A",
                  color: "#1A1A1A",
                  backgroundColor: "white",
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={
                currentStep === totalSteps ? () => alert("Account created! Redirecting to dashboard...") : nextStep
              }
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: "#1E40AF",
                border: "2px solid #1A1A1A",
              }}
            >
              {currentStep === totalSteps ? "Create Account" : "Continue"}
              {currentStep < totalSteps && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MomentumOnboarding
