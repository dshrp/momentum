"use client"

import { useState, useEffect } from "react"
import {
  Zap,
  Heart,
  Calendar,
  Instagram,
  ArrowRight,
  CheckCircle,
  Loader,
  Mail,
  UserPlus,
  X,
  Send,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react"

const MomentumAbout = () => {
  const [donationAmount, setDonationAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [donationSuccess, setDonationSuccess] = useState(false)
  const [donationError, setDonationError] = useState(null)

  // Check for donation success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("donation") === "success") {
      setDonationSuccess(true)
      setTimeout(() => setDonationSuccess(false), 10000) // Show for 10 seconds
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Waitlist modal state
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [waitlistData, setWaitlistData] = useState({ name: "", email: "" })
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactData, setContactData] = useState({ name: "", email: "", message: "" })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  const handleDonation = async () => {
    setIsProcessing(true)
    setDonationError(null)

    try {
      const amount = customAmount ? Number.parseFloat(customAmount) : donationAmount

      console.log("🚀 Starting donation process:", { amount, customAmount, donationAmount })

      if (amount < 1) {
        throw new Error("Minimum donation is $1")
      }

      if (isNaN(amount)) {
        throw new Error("Please enter a valid amount")
      }

      console.log("💰 Creating payment session for $" + amount)

      // Create checkout session
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
        }),
      })

      console.log("📡 Payment API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Payment API error:", errorData)
        throw new Error(errorData.error || `Payment failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Payment API response data:", data)

      // Check if we got a checkout URL
      if (data.url) {
        console.log("🔗 Redirecting to Stripe Checkout:", data.url)
        // Force redirect to Stripe
        window.location.href = data.url
        return
      }

      // If we get here, something unexpected happened
      console.error("❌ No checkout URL received:", data)
      throw new Error("No checkout URL received from payment service")
    } catch (error) {
      console.error("💥 Donation error:", error)
      setDonationError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault()
    if (!waitlistData.name || !waitlistData.email) {
      alert("Please fill in all fields")
      return
    }

    setWaitlistLoading(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(waitlistData),
      })

      if (response.ok) {
        setWaitlistSuccess(true)
        setWaitlistData({ name: "", email: "" })
        setTimeout(() => {
          setShowWaitlistModal(false)
          setWaitlistSuccess(false)
        }, 2000)
      } else {
        throw new Error("Failed to join waitlist")
      }
    } catch (error) {
      console.error("Waitlist error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setWaitlistLoading(false)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    if (!contactData.name || !contactData.email || !contactData.message) {
      alert("Please fill in all fields")
      return
    }

    setContactLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      })

      if (response.ok) {
        setContactSuccess(true)
        setContactData({ name: "", email: "", message: "" })
        setTimeout(() => {
          setShowContactModal(false)
          setContactSuccess(false)
        }, 2000)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Contact error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFCF5" }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
                  About Momentum
                </h1>
                <p className="text-sm" style={{ color: "#4A4A4A" }}>
                  Never miss your friends' events again
                </p>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: "#1E40AF",
                color: "white",
                border: "2px solid #1A1A1A",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#1A1A1A" }}>
            The Problem We're Solving
          </h2>
          <p className="text-xl mb-8" style={{ color: "#4A4A4A" }}>
            Your friends are constantly posting about events, but you're missing them because social media algorithms
            hide posts and stories disappear after 24 hours.
          </p>
          <div
            className="p-8 rounded-xl"
            style={{
              border: "3px solid #1A1A1A",
              backgroundColor: "#F0F9FF",
            }}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
              Momentum automatically finds and organizes your friends' events
            </h3>
            <p className="text-lg" style={{ color: "#4A4A4A" }}>
              So you never have to worry about missing out on the good times again.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: "#1A1A1A" }}>
            How Momentum Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Monitor Instagram
              </h4>
              <p style={{ color: "#4A4A4A" }}>
                We track your friends' Instagram accounts for event posts and stories, catching everything the algorithm
                might hide.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Organize Everything
              </h4>
              <p style={{ color: "#4A4A4A" }}>
                All events are automatically organized in one clean dashboard, with calendar integration and sharing
                features.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
                Coming Soon
              </h4>
              <p style={{ color: "#4A4A4A" }}>
                We'll add more event page support and send Wednesday roundups to your inbox of events.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: "#1A1A1A" }}>
            What Makes Momentum Special
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Automatic event detection from Instagram stories and posts",
              "Clean, organized dashboard that cuts through social media noise",
              "One-click calendar integration for all events",
              "Smart duplicate detection and event deduplication",
              "Shareable event lists for friend groups",
              "Mobile-friendly design that works everywhere",
              "Weekly digest emails (coming soon)",
              "Support for more event platforms (coming soon)",
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="font-medium" style={{ color: "#1A1A1A" }}>
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* The Story - UPDATED COPY */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: "#1A1A1A" }}>
            Why I Built This
          </h3>
          <div
            className="p-8 rounded-xl"
            style={{
              border: "3px solid #1A1A1A",
              backgroundColor: "white",
            }}
          >
            <p className="text-lg mb-6" style={{ color: "#4A4A4A" }}>
              My name's Daniel. I'm an artist, musician, and organizer in Detroit and NYC. With so much information
              lately blasted my way, I was constantly missing my friends' events. They'd post about a show or party on
              Instagram, but I wouldn't see it until after it happened. The algorithm would hide their posts, or I'd
              miss their stories because I wasn't checking at the right time.
            </p>
            <p className="text-lg mb-6" style={{ color: "#4A4A4A" }}>
              As someone in the creative community, I have friends who are DJs, artists, poets, and event organizers.
              They're always doing cool stuff, but keeping track of it all was impossible.
            </p>
            <p className="text-lg" style={{ color: "#4A4A4A" }}>
              So I built Momentum to solve this problem for myself and my friends. Now, I know what's happening when,
              and I can show up for my friends—in a time where showing up matters more than ever.
            </p>
          </div>
        </div>

        {/* NEW: Summarizer App Promo */}
        <div className="mb-16 overflow-hidden rounded-xl" style={{ border: "3px solid #1A1A1A" }}>
          <div className="flex flex-col md:flex-row">
            <div
              className="flex flex-col items-center justify-center p-10 text-white"
              style={{ backgroundColor: "#1E40AF", flex: "1" }}
            >
              <div className="w-24 h-24 bg-blue-400 bg-opacity-30 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-center">Summarize any podcast</h3>
            </div>
            <div className="p-8 flex flex-col justify-center" style={{ backgroundColor: "#F0F9FF", flex: "1.2" }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
                More from the Creator
              </h3>
              <p className="text-lg mb-6" style={{ color: "#4A4A4A" }}>
                Summarizer uses AI to create concise summaries of YouTube podcast transcripts. Upload any .txt file and
                get key points and insights instantly.
              </p>
              <a
                href="https://summarizer.thedscs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity self-start"
                style={{
                  backgroundColor: "#1E40AF",
                  color: "white",
                  border: "2px solid #1A1A1A",
                }}
              >
                Visit Summarizer <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div
          className="p-8 rounded-xl text-center mb-16"
          style={{
            border: "3px solid #1A1A1A",
            backgroundColor: "#FEF3C7",
          }}
        >
          <Heart className="w-12 h-12 mx-auto mb-6 text-red-500" />
          <h3 className="text-2xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
            Support Momentum's Development
          </h3>
          <p className="text-lg mb-8" style={{ color: "#4A4A4A" }}>
            Momentum is a passion project built to help creative communities stay connected. If it's helping you
            discover and attend more events, consider supporting its continued development.
          </p>

          {/* Donation Success */}
          {donationSuccess && (
            <div
              className="p-4 rounded-xl mb-6 flex items-center justify-center gap-3"
              style={{
                border: "2px solid #16A34A",
                backgroundColor: "#DCFCE7",
              }}
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-center">
                <p className="font-semibold text-green-800">Thank you so much for your support! 🎉</p>
                <p className="text-sm text-green-700">Your payment was processed successfully via Stripe.</p>
              </div>
            </div>
          )}

          {/* Donation Error */}
          {donationError && (
            <div
              className="p-4 rounded-xl mb-6 flex items-center justify-center gap-3"
              style={{
                border: "2px solid #DC2626",
                backgroundColor: "#FEF2F2",
              }}
            >
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div className="text-center">
                <p className="font-semibold text-red-800">Payment Error</p>
                <p className="text-sm text-red-700">{donationError}</p>
                <button onClick={() => setDonationError(null)} className="text-xs text-red-600 underline mt-1">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Donation Options */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-3 mb-6">
              {[5, 10, 25].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setDonationAmount(amount)
                    setCustomAmount("")
                    setDonationError(null)
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                    donationAmount === amount && !customAmount ? "text-white" : "hover:opacity-70"
                  }`}
                  style={{
                    backgroundColor: donationAmount === amount && !customAmount ? "#1E40AF" : "white",
                    color: donationAmount === amount && !customAmount ? "white" : "#1A1A1A",
                    border: "2px solid #1A1A1A",
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setDonationAmount(0)
                  setDonationError(null)
                }}
                placeholder="Custom amount"
                className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{
                  border: "2px solid #1A1A1A",
                  backgroundColor: "white",
                  color: "#1A1A1A",
                }}
              />
            </div>

            <button
              onClick={handleDonation}
              disabled={isProcessing || (!donationAmount && !customAmount)}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 text-white rounded-xl text-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "#1E40AF",
                border: "2px solid #1A1A1A",
              }}
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Donate ${customAmount || donationAmount}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-sm mt-4" style={{ color: "#4A4A4A" }}>
              Secure payment processing powered by Stripe • Live payments enabled
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
            Questions or Feedback?
          </h3>
          <p className="text-lg mb-8" style={{ color: "#4A4A4A" }}>
            Join our waitlist for updates or reach out with feedback and feature requests.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: "#1E40AF",
                color: "white",
                border: "2px solid #1A1A1A",
              }}
            >
              <UserPlus className="w-5 h-5" />
              Add me to the waitlist
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: "white",
                color: "#1A1A1A",
                border: "2px solid #1A1A1A",
              }}
            >
              <Mail className="w-5 h-5" />
              Write to us
            </button>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md" style={{ border: "3px solid #1A1A1A" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
                Join the Waitlist
              </h3>
              <button
                onClick={() => setShowWaitlistModal(false)}
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

            {waitlistSuccess && (
              <div
                className="p-4 rounded-xl mb-6 flex items-center gap-3"
                style={{
                  border: "2px solid #16A34A",
                  backgroundColor: "#DCFCE7",
                }}
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-800">Thanks! You're on the list! 🎉</p>
              </div>
            )}

            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={waitlistData.name}
                  onChange={(e) => setWaitlistData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#FEFCF5",
                    color: "#1A1A1A",
                  }}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={waitlistData.email}
                  onChange={(e) => setWaitlistData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#FEFCF5",
                    color: "#1A1A1A",
                  }}
                  placeholder="your.email@gmail.com"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWaitlistModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold transition-opacity hover:opacity-70"
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
                  disabled={waitlistLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{
                    backgroundColor: "#1E40AF",
                    border: "2px solid #1A1A1A",
                  }}
                >
                  {waitlistLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Join Waitlist
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md" style={{ border: "3px solid #1A1A1A" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
                Write to Us
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
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

            {contactSuccess && (
              <div
                className="p-4 rounded-xl mb-6 flex items-center gap-3"
                style={{
                  border: "2px solid #16A34A",
                  backgroundColor: "#DCFCE7",
                }}
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-800">Message sent! We'll get back to you soon. 📧</p>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) => setContactData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#FEFCF5",
                    color: "#1A1A1A",
                  }}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#FEFCF5",
                    color: "#1A1A1A",
                  }}
                  placeholder="your.email@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
                  Message
                </label>
                <textarea
                  value={contactData.message}
                  onChange={(e) => setContactData((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  style={{
                    border: "2px solid #1A1A1A",
                    backgroundColor: "#FEFCF5",
                    color: "#1A1A1A",
                  }}
                  placeholder="Tell us what's on your mind..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold transition-opacity hover:opacity-70"
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
                  disabled={contactLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{
                    backgroundColor: "#1E40AF",
                    border: "2px solid #1A1A1A",
                  }}
                >
                  {contactLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MomentumAbout
