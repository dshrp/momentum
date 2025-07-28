"use client"

import { useState } from "react"
import {
  Calendar,
  Zap,
  Instagram,
  ExternalLink,
  FileText,
  CreditCard,
  Mail,
  MessageSquare,
  ArrowLeft,
} from "lucide-react"
import { trackMomentumEvent } from "../../lib/analytics"

export default function MomentumAbout() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, message }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setEmail("")
        setMessage("")
        trackMomentumEvent.contactSubmit()
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--momentum-cream))]">
      {/* Header */}
      <div className="bg-[hsl(var(--momentum-card-bg))] shadow-sm border-b-[3px] border-[hsl(var(--momentum-border))]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-xl hover:opacity-70 transition-opacity"
              style={{
                border: "2px solid hsl(var(--momentum-border))",
                backgroundColor: "hsl(var(--momentum-card-bg))",
                color: "hsl(var(--momentum-text-primary))",
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[hsl(var(--momentum-text-primary))]">About Momentum</h1>
                <p className="text-sm text-[hsl(var(--momentum-text-secondary))]">
                  Never miss your friends' events again
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-[hsl(var(--momentum-text-primary))]">
            Stay Connected to Your Creative Community
          </h2>
          <p className="text-xl text-[hsl(var(--momentum-text-secondary))] max-w-3xl mx-auto leading-relaxed">
            Momentum automatically tracks Instagram posts from your friends and favorite artists, surfacing the events
            and shows you care about most - all in one organized dashboard.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-[hsl(var(--momentum-text-primary))]">
            How Momentum Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">
                Connect Your Sources
              </h4>
              <p className="text-[hsl(var(--momentum-text-secondary))]">
                Add Instagram accounts of friends, artists, venues, and promoters you want to follow
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">
                Automatic Detection
              </h4>
              <p className="text-[hsl(var(--momentum-text-secondary))]">
                Our AI scans posts and stories to identify events, shows, and gatherings
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">
                Organized Dashboard
              </h4>
              <p className="text-[hsl(var(--momentum-text-secondary))]">
                View all upcoming events in one place, with dates, times, and venue information
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-[hsl(var(--momentum-text-primary))]">Key Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-6 border-[3px] border-[hsl(var(--momentum-border))]">
              <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">
                🎯 Smart Event Detection
              </h4>
              <p className="text-[hsl(var(--momentum-text-secondary))]">
                Advanced AI identifies events from Instagram posts and stories, even when details are scattered across
                multiple posts
              </p>
            </div>
            <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-6 border-[3px] border-[hsl(var(--momentum-border))]">
              <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">
                📅 Calendar Integration
              </h4>
              <p className="text-[hsl(var(--momentum-text-secondary))]">
                One-click export to Google Calendar, Apple Calendar, or any calendar app that supports .ics files
              </p>
            </div>
            <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-6 border-[3px] border-[hsl(var(--momentum-border))]">
              <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">✏️ Event Editing</h4>
              <p className="text-[hsl(var(--momentum-text-secondary))]">
                Add missing details, correct information, or hide events you're not interested in
              </p>
            </div>
            <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-6 border-[3px] border-[hsl(var(--momentum-border))]">
              <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--momentum-text-primary))]">
                🔄 Real-time Updates
              </h4>
              <p className="text-[hsl(var(--momentum-text-secondary))]">
                Automatic refresh keeps your event list current with the latest posts from your followed accounts
              </p>
            </div>
          </div>
        </div>

        {/* More from Momentum Section */}
        <div className="mb-16">
          <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl overflow-hidden border-[3px] border-[hsl(var(--momentum-border))] shadow-lg">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Blue background */}
              <div className="lg:w-1/2 bg-gradient-to-br from-blue-800 to-blue-900 p-8 lg:p-12 flex flex-col justify-center items-center text-center">
                <Calendar className="w-16 h-16 text-white mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Never miss an event</h3>
              </div>

              {/* Right side - Light background */}
              <div className="lg:w-1/2 p-8 lg:p-12 bg-blue-50">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">More from Momentum</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Discover events you're missing on Instagram. Momentum helps you see creative community events buried
                  by the algorithm, all in one place.
                </p>
                <a
                  href="/"
                  onClick={() => trackMomentumEvent.visitAbout()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors border-2 border-blue-700"
                >
                  Visit Momentum
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Summarizer App Section */}
        <div className="mb-16">
          <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl overflow-hidden border-[3px] border-[hsl(var(--momentum-border))] shadow-lg">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Blue background */}
              <div className="lg:w-1/2 bg-gradient-to-br from-blue-800 to-blue-900 p-8 lg:p-12 flex flex-col justify-center items-center text-center">
                <FileText className="w-16 h-16 text-white mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Summarize any podcast</h3>
              </div>

              {/* Right side - Light background */}
              <div className="lg:w-1/2 p-8 lg:p-12 bg-blue-50">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Summarizer</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Upload YouTube podcast transcripts (.txt files) and get AI-powered summaries. Perfect for quickly
                  understanding long-form content and extracting key insights.
                </p>
                <a
                  href="https://summarizer.thedscs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors border-2 border-blue-700"
                >
                  Visit Summarizer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-[hsl(var(--momentum-text-primary))]">
            Support Momentum
          </h3>
          <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-8 border-[3px] border-[hsl(var(--momentum-border))] text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--momentum-deep-blue))]" />
            <h4 className="text-xl font-semibold mb-4 text-[hsl(var(--momentum-text-primary))]">
              Help Keep Momentum Running
            </h4>
            <p className="text-[hsl(var(--momentum-text-secondary))] mb-6 max-w-2xl mx-auto">
              Momentum is a passion project that helps creative communities stay connected. Your support helps cover
              server costs and keeps the service free for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  trackMomentumEvent.donate(5)
                  window.open("https://buy.stripe.com/test_your_link_here", "_blank")
                }}
                className="px-6 py-3 bg-[hsl(var(--momentum-deep-blue))] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Donate $5
              </button>
              <button
                onClick={() => {
                  trackMomentumEvent.donate(10)
                  window.open("https://buy.stripe.com/test_your_link_here", "_blank")
                }}
                className="px-6 py-3 bg-[hsl(var(--momentum-deep-blue))] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Donate $10
              </button>
              <button
                onClick={() => {
                  trackMomentumEvent.donate(25)
                  window.open("https://buy.stripe.com/test_your_link_here", "_blank")
                }}
                className="px-6 py-3 bg-[hsl(var(--momentum-deep-blue))] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Donate $25
              </button>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-[hsl(var(--momentum-text-primary))]">Get in Touch</h3>
          <div className="bg-[hsl(var(--momentum-card-bg))] rounded-xl p-8 border-[3px] border-[hsl(var(--momentum-border))]">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--momentum-deep-blue))]" />
                <h4 className="text-xl font-semibold mb-2 text-[hsl(var(--momentum-text-primary))]">
                  Questions or Feedback?
                </h4>
                <p className="text-[hsl(var(--momentum-text-secondary))]">
                  We'd love to hear from you! Send us a message and we'll get back to you soon.
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2 text-[hsl(var(--momentum-text-primary))]"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-[2px] border-[hsl(var(--momentum-border))] focus:border-[hsl(var(--momentum-deep-blue))] focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "hsl(var(--momentum-card-bg))",
                      color: "hsl(var(--momentum-text-primary))",
                    }}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2 text-[hsl(var(--momentum-text-primary))]"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-[2px] border-[hsl(var(--momentum-border))] focus:border-[hsl(var(--momentum-deep-blue))] focus:outline-none transition-colors resize-vertical"
                    style={{
                      backgroundColor: "hsl(var(--momentum-card-bg))",
                      color: "hsl(var(--momentum-text-primary))",
                    }}
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[hsl(var(--momentum-deep-blue))] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>

              {submitStatus === "success" && (
                <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-xl">
                  <p className="text-green-800 font-semibold">✅ Message sent successfully!</p>
                  <p className="text-green-700 text-sm">We'll get back to you soon.</p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl">
                  <p className="text-red-800 font-semibold">❌ Failed to send message</p>
                  <p className="text-red-700 text-sm">Please try again or email us directly.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[hsl(var(--momentum-text-secondary))]">
          <p className="mb-2">Built with ❤️ for the creative community</p>
          <p className="text-sm">© 2024 Momentum. Made to help you never miss the moments that matter.</p>
        </div>
      </div>
    </div>
  )
}
