"use client"

import { useState, useEffect } from "react"
import { Heart, ExternalLink, Coffee, Zap, Users, Target, ArrowRight, CheckCircle, XCircle } from "lucide-react"
import { trackEvent } from "../../lib/analytics"

const MomentumAbout = () => {
  const [donationAmount, setDonationAmount] = useState(5)
  const [showDonationFlow, setShowDonationFlow] = useState(false)
  const [donationStatus, setDonationStatus] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check for donation status in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const donation = urlParams.get("donation")
    const sessionId = urlParams.get("session_id")

    if (donation === "success") {
      setDonationStatus("success")
      trackEvent("donation_completed", {
        session_id: sessionId,
        amount: donationAmount,
      })
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (donation === "cancelled") {
      setDonationStatus("cancelled")
      trackEvent("donation_cancelled", {
        amount: donationAmount,
      })
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [donationAmount])

  const handleDonation = async () => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      console.log("🎯 Starting donation process for $" + donationAmount)

      trackEvent("donation_initiated", {
        amount: donationAmount,
        amount_cents: donationAmount * 100,
      })

      // Create checkout session
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: donationAmount * 100, // Convert to cents
        }),
      })

      console.log("📡 Payment API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Payment API error:", errorData)
        throw new Error(errorData.error || "Failed to create payment session")
      }

      const data = await response.json()
      console.log("✅ Payment session created:", data)

      if (data.url) {
        console.log("🔄 Redirecting to Stripe Checkout:", data.url)
        trackEvent("donation_redirect_to_stripe", {
          session_id: data.sessionId,
          amount: donationAmount,
        })
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received from Stripe")
      }
    } catch (error) {
      console.error("💥 Donation failed:", error)
      setDonationStatus("error")
      trackEvent("donation_error", {
        error: error.message,
        amount: donationAmount,
      })
      alert("Sorry, there was an error processing your donation. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const presetAmounts = [5, 10, 25, 50]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F9FF" }}>
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
              About Momentum
            </h1>
            <p className="text-xl" style={{ color: "#4A4A4A" }}>
              Helping creative communities stay connected through event discovery
            </p>
          </div>

          {/* Mission Section */}
          <div
            className="p-8 rounded-2xl mb-8"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "white",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8" style={{ color: "#1E40AF" }} />
              <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                Our Mission
              </h2>
            </div>
            <p className="text-lg leading-relaxed mb-6" style={{ color: "#4A4A4A" }}>
              Momentum was born from a simple observation: creative communities are scattered across Instagram, posting
              events in stories that disappear, making it hard for people to discover and attend the experiences that
              matter to them.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: "#4A4A4A" }}>
              We're building a bridge between event organizers and their audiences, making it easier than ever to stay
              connected with the creative communities you care about.
            </p>
          </div>

          {/* How It Works */}
          <div
            className="p-8 rounded-2xl mb-8"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "white",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8" style={{ color: "#1E40AF" }} />
              <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                How It Works
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#1E40AF" }}
                >
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Follow Sources
                </h3>
                <p style={{ color: "#4A4A4A" }}>Connect your favorite Instagram accounts and event organizers</p>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#1E40AF" }}
                >
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Auto-Discovery
                </h3>
                <p style={{ color: "#4A4A4A" }}>We automatically find and organize events from their posts</p>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#1E40AF" }}
                >
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Never Miss Out
                </h3>
                <p style={{ color: "#4A4A4A" }}>Get a personalized feed of events you actually want to attend</p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div
            className="p-8 rounded-2xl mb-8"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "white",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Coffee className="w-8 h-8" style={{ color: "#1E40AF" }} />
              <h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                Support Momentum
              </h2>
            </div>

            {/* Donation Status Messages */}
            {donationStatus === "success" && (
              <div
                className="p-4 rounded-xl mb-6 flex items-center gap-3"
                style={{
                  border: "2px solid #10B981",
                  backgroundColor: "#ECFDF5",
                }}
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">Thank you for your donation! 🎉</p>
                  <p className="text-green-700">Your support helps us keep Momentum running and improving.</p>
                </div>
              </div>
            )}

            {donationStatus === "cancelled" && (
              <div
                className="p-4 rounded-xl mb-6 flex items-center gap-3"
                style={{
                  border: "2px solid #F59E0B",
                  backgroundColor: "#FFFBEB",
                }}
              >
                <XCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-800">Donation cancelled</p>
                  <p className="text-amber-700">No worries! You can try again anytime.</p>
                </div>
              </div>
            )}

            {donationStatus === "error" && (
              <div
                className="p-4 rounded-xl mb-6 flex items-center gap-3"
                style={{
                  border: "2px solid #EF4444",
                  backgroundColor: "#FEF2F2",
                }}
              >
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-bold text-red-800">Something went wrong</p>
                  <p className="text-red-700">Please try again or contact support if the issue persists.</p>
                </div>
              </div>
            )}

            <p className="text-lg mb-6" style={{ color: "#4A4A4A" }}>
              Momentum is a passion project built to serve creative communities. Your support helps us cover server
              costs, improve the platform, and keep the service free for everyone.
            </p>

            {!showDonationFlow ? (
              <button
                onClick={() => {
                  setShowDonationFlow(true)
                  trackEvent("donation_flow_opened")
                }}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1E40AF" }}
              >
                <Heart className="w-5 h-5" />
                Support Momentum
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="font-semibold mb-4" style={{ color: "#1A1A1A" }}>
                    Choose an amount:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setDonationAmount(amount)
                          trackEvent("donation_amount_selected", { amount })
                        }}
                        className={`p-3 rounded-xl font-bold transition-all ${
                          donationAmount === amount ? "text-white" : "hover:opacity-70"
                        }`}
                        style={{
                          backgroundColor: donationAmount === amount ? "#1E40AF" : "white",
                          border: "2px solid #1A1A1A",
                          color: donationAmount === amount ? "white" : "#1A1A1A",
                        }}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#1A1A1A" }}>$</span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={donationAmount}
                      onChange={(e) => {
                        const value = Math.max(1, Number.parseInt(e.target.value) || 1)
                        setDonationAmount(value)
                        trackEvent("donation_custom_amount", { amount: value })
                      }}
                      className="flex-1 p-3 rounded-xl font-bold"
                      style={{
                        border: "2px solid #1A1A1A",
                        color: "#1A1A1A",
                      }}
                      placeholder="Custom amount"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDonationFlow(false)
                      trackEvent("donation_flow_cancelled")
                    }}
                    disabled={isProcessing}
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
                    onClick={handleDonation}
                    disabled={isProcessing || !donationAmount || donationAmount < 1}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{
                      backgroundColor: "#1E40AF",
                      border: "2px solid #1A1A1A",
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Donate ${donationAmount}
                      </>
                    )}
                  </button>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#F0F9FF",
                  }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: "#1E40AF" }}>
                    🔒 Secure payment processing
                  </p>
                  <p className="text-sm" style={{ color: "#4A4A4A" }}>
                    Powered by Stripe. Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div
            className="p-8 rounded-2xl text-center"
            style={{
              border: "2px solid #1A1A1A",
              backgroundColor: "white",
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
              Get In Touch
            </h2>
            <p className="text-lg mb-6" style={{ color: "#4A4A4A" }}>
              Have questions, feedback, or want to collaborate? We'd love to hear from you.
            </p>
            <a
              href="mailto:hello@momentum.thedscs.com"
              onClick={() => trackEvent("contact_email_clicked")}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#1E40AF" }}
            >
              <ExternalLink className="w-4 h-4" />
              hello@momentum.thedscs.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MomentumAbout
