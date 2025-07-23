"use client"

import { useState } from "react"
import {
  Zap,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Instagram,
  Music,
  Chrome,
  Key,
  Globe,
  CheckCircle,
  Loader,
  ExternalLink,
} from "lucide-react"

const MomentumChromeExtension = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [setupData, setSetupData] = useState({
    googleAuth: false,
    sources: {
      instagram: [""],
      residentAdvisor: [""],
    },
    automationStatus: "pending", // pending, setting-up, complete, error
  })

  const totalSteps = 3

  const updateSetupData = (field, value) => {
    setSetupData((prev) => ({ ...prev, [field]: value }))
  }

  const addSource = (type) => {
    setSetupData((prev) => ({
      ...prev,
      sources: {
        ...prev.sources,
        [type]: [...prev.sources[type], ""],
      },
    }))
  }

  const updateSource = (type, index, value) => {
    setSetupData((prev) => ({
      ...prev,
      sources: {
        ...prev.sources,
        [type]: prev.sources[type].map((item, i) => (i === index ? value : item)),
      },
    }))
  }

  const removeSource = (type, index) => {
    setSetupData((prev) => ({
      ...prev,
      sources: {
        ...prev.sources,
        [type]: prev.sources[type].filter((_, i) => i !== index),
      },
    }))
  }

  const setupAutomation = async () => {
    updateSetupData("automationStatus", "setting-up")

    // In real implementation, this would:
    // 1. Create user in Airtable
    // 2. Call Make.com API to create scenarios
    // 3. Configure Instagram RSS, RA RSS monitoring

    setTimeout(() => {
      updateSetupData("automationStatus", "complete")
    }, 5000)
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
                <Chrome className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Welcome to Momentum!
              </h2>
              <p className="text-lg mb-6" style={{ color: "#4A4A4A" }}>
                Never miss your friends' events again. Let's set up automatic event detection in 2 simple steps.
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: "#F0F9FF",
              }}
            >
              <h3 className="font-bold mb-4" style={{ color: "#1A1A1A" }}>
                What Momentum Does:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium" style={{ color: "#1A1A1A" }}>
                    Monitors your friends' Instagram stories for events
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium" style={{ color: "#1A1A1A" }}>
                    Tracks Resident Advisor for DJ gigs and shows
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium" style={{ color: "#1A1A1A" }}>
                    Sends you one clean weekly digest every Wednesday
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium" style={{ color: "#1A1A1A" }}>
                    Creates shareable event lists for your friend groups
                  </span>
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: "#FEF3C7",
              }}
            >
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 mt-0.5" style={{ color: "#92400E" }} />
                <div>
                  <p className="font-bold" style={{ color: "#92400E" }}>
                    100% Automated Setup
                  </p>
                  <p className="text-sm" style={{ color: "#92400E" }}>
                    We'll automatically create all the behind-the-scenes automation for you. No technical setup
                    required!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: "#1E40AF" }} />
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Add Your Friends' Accounts
              </h2>
              <p className="text-lg" style={{ color: "#4A4A4A" }}>
                Tell us which friends to follow for events across platforms
              </p>
            </div>

            {/* Instagram Section */}
            <div className="p-5 rounded-xl" style={{ border: "2px solid #1A1A1A", backgroundColor: "#FEFCF5" }}>
              <div className="flex items-center gap-3 mb-4">
                <Instagram className="w-6 h-6" style={{ color: "#E1306C" }} />
                <h3 className="font-bold" style={{ color: "#1A1A1A" }}>
                  Instagram Accounts
                </h3>
              </div>
              <p className="text-sm mb-4" style={{ color: "#4A4A4A" }}>
                Add your friends' Instagram handles. We'll monitor their stories and posts for event announcements.
              </p>
              {setupData.sources.instagram.map((handle, index) => (
                <div key={index} className="flex gap-3 mb-3">
                  <div className="relative flex-1">
                    <span
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 font-bold"
                      style={{ color: "#4A4A4A" }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => updateSource("instagram", index, e.target.value)}
                      placeholder="friendsusername"
                      className="w-full pl-8 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{
                        border: "2px solid #1A1A1A",
                        backgroundColor: "white",
                        color: "#1A1A1A",
                      }}
                    />
                  </div>
                  {setupData.sources.instagram.length > 1 && (
                    <button
                      onClick={() => removeSource("instagram", index)}
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
                onClick={() => addSource("instagram")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "white",
                  color: "#1A1A1A",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Instagram Account
              </button>
            </div>

            {/* Resident Advisor Section */}
            <div className="p-5 rounded-xl" style={{ border: "2px solid #1A1A1A", backgroundColor: "#FEFCF5" }}>
              <div className="flex items-center gap-3 mb-4">
                <Music className="w-6 h-6" style={{ color: "#1E40AF" }} />
                <h3 className="font-bold" style={{ color: "#1A1A1A" }}>
                  Resident Advisor Artists
                </h3>
              </div>
              <p className="text-sm mb-4" style={{ color: "#4A4A4A" }}>
                Add DJ/artist names from Resident Advisor to track their upcoming gigs.
              </p>
              {setupData.sources.residentAdvisor.map((artist, index) => (
                <div key={index} className="flex gap-3 mb-3">
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
                      onChange={(e) => updateSource("residentAdvisor", index, e.target.value)}
                      placeholder="artist-name"
                      className="w-full pl-20 pr-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{
                        border: "2px solid #1A1A1A",
                        backgroundColor: "white",
                        color: "#1A1A1A",
                      }}
                    />
                  </div>
                  {setupData.sources.residentAdvisor.length > 1 && (
                    <button
                      onClick={() => removeSource("residentAdvisor", index)}
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
                onClick={() => addSource("residentAdvisor")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-70 transition-opacity"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "white",
                  color: "#1A1A1A",
                }}
              >
                <Plus className="w-4 h-4" />
                Add RA Artist
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: "#1E40AF" }} />
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Setting Up Your Automation
              </h2>
              <p className="text-lg" style={{ color: "#4A4A4A" }}>
                We're creating your personalized event detection system...
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                border: "2px solid #1A1A1A",
                backgroundColor: setupData.automationStatus === "complete" ? "#F0FDF4" : "#FEFCF5",
              }}
            >
              {setupData.automationStatus === "pending" && (
                <div className="text-center">
                  <p className="mb-6 font-medium" style={{ color: "#1A1A1A" }}>
                    Ready to create your automated event detection system?
                  </p>
                  <button
                    onClick={setupAutomation}
                    className="px-8 py-4 text-white rounded-xl text-lg font-bold hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: "#1E40AF",
                      border: "2px solid #1A1A1A",
                    }}
                  >
                    Start Automation Setup
                  </button>
                </div>
              )}

              {setupData.automationStatus === "setting-up" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader className="w-5 h-5 animate-spin" style={{ color: "#1E40AF" }} />
                    <span className="font-medium" style={{ color: "#1A1A1A" }}>
                      Creating your Airtable database...
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Loader className="w-5 h-5 animate-spin" style={{ color: "#1E40AF" }} />
                    <span className="font-medium" style={{ color: "#1A1A1A" }}>
                      Configuring Instagram story tracking...
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Loader className="w-5 h-5 animate-spin" style={{ color: "#1E40AF" }} />
                    <span className="font-medium" style={{ color: "#1A1A1A" }}>
                      Connecting Resident Advisor RSS feeds...
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Loader className="w-5 h-5 animate-spin" style={{ color: "#1E40AF" }} />
                    <span className="font-medium" style={{ color: "#1A1A1A" }}>
                      Scheduling weekly digest emails...
                    </span>
                  </div>
                </div>
              )}

              {setupData.automationStatus === "complete" && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
                  <h3 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
                    🎉 You're All Set!
                  </h3>
                  <p className="font-medium" style={{ color: "#4A4A4A" }}>
                    Momentum is now automatically monitoring your sources for events. You'll receive your first weekly
                    digest next Wednesday at 8 AM.
                  </p>
                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={() => window.open("momentum.thedscs.com", "_blank")}
                      className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: "#1E40AF",
                        border: "2px solid #1A1A1A",
                      }}
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open Dashboard
                    </button>
                    <button
                      onClick={() => window.close()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:opacity-70 transition-opacity"
                      style={{
                        border: "2px solid #1A1A1A",
                        color: "#1A1A1A",
                        backgroundColor: "white",
                      }}
                    >
                      Close Extension
                    </button>
                  </div>
                </div>
              )}
            </div>

            {setupData.automationStatus === "complete" && (
              <div
                className="p-4 rounded-xl"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "#F0F9FF",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "#1E40AF" }}>
                  💡 <strong>Pro tip:</strong> You can always add more friends or sources later from your dashboard. The
                  automation will automatically include them in future scans!
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-96 h-[600px] overflow-y-auto" style={{ backgroundColor: "#FEFCF5" }}>
      {/* Header */}
      <div className="bg-white shadow-sm p-4" style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-800 to-blue-900 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
              Momentum
            </h1>
            <p className="text-xs" style={{ color: "#4A4A4A" }}>
              Chrome Extension Setup
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium" style={{ color: "#4A4A4A" }}>
            {Math.round((currentStep / totalSteps) * 100)}%
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

      {/* Content */}
      <div className="p-4">
        {renderStep()}

        {/* Navigation Buttons */}
        {setupData.automationStatus !== "complete" && (
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold hover:opacity-70 transition-opacity"
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

            {currentStep < 3 && (
              <button
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: "#1E40AF",
                  border: "2px solid #1A1A1A",
                }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MomentumChromeExtension
