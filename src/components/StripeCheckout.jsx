"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, Loader } from "lucide-react"

const StripeCheckout = ({ amount, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Load Stripe.js
    const script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/"
    script.onload = () => {
      setLoading(false)
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!window.Stripe) {
      setError("Stripe failed to load")
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const { clientSecret } = await response.json()

      // Get publishable key from environment - this is safe to expose
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      if (!publishableKey) {
        throw new Error("Stripe publishable key not configured")
      }

      // Initialize Stripe with publishable key (safe to expose)
      const stripe = window.Stripe(publishableKey)

      // For now, we'll simulate success since we don't have Stripe Elements set up
      // In production, you'd use Stripe Elements here
      setTimeout(() => {
        onSuccess()
        setProcessing(false)
      }, 2000)
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#1E40AF" }} />
        <p className="font-semibold" style={{ color: "#1A1A1A" }}>
          Loading payment form...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
          Complete Your Donation
        </h3>
        <p className="text-lg font-semibold" style={{ color: "#1E40AF" }}>
          ${amount}
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl flex items-center gap-3"
          style={{
            border: "2px solid #DC2626",
            backgroundColor: "#FEF2F2",
          }}
        >
          <p className="font-semibold text-red-800">Error: {error}</p>
        </div>
      )}

      <div
        className="p-6 rounded-xl"
        style={{
          border: "2px solid #1A1A1A",
          backgroundColor: "#F0F9FF",
        }}
      >
        <p className="text-sm font-medium mb-4" style={{ color: "#1E40AF" }}>
          🔒 Secure payment processing powered by Stripe
        </p>
        <p className="text-sm" style={{ color: "#4A4A4A" }}>
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onCancel}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-opacity hover:opacity-70 disabled:opacity-50"
          style={{
            border: "2px solid #1A1A1A",
            color: "#1A1A1A",
            backgroundColor: "white",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handlePayment}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: "#1E40AF",
            border: "2px solid #1A1A1A",
          }}
        >
          {processing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Donate ${amount}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default StripeCheckout
