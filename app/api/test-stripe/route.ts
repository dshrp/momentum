import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        error: "STRIPE_SECRET_KEY not found",
        recommendation: "Add your Stripe secret key to environment variables",
      })
    }

    console.log("🧪 Testing Stripe with key:", stripeSecretKey.substring(0, 8) + "...")

    // Get the origin for redirect URLs
    const origin = request.headers.get("origin") || "https://momentum.thedscs.com"

    // Use Stripe's REST API directly
    const stripeApiUrl = "https://api.stripe.com/v1/checkout/sessions"

    // Prepare form data for Stripe API
    const formData = new URLSearchParams()
    formData.append("payment_method_types[]", "card")
    formData.append("line_items[0][price_data][currency]", "usd")
    formData.append("line_items[0][price_data][product_data][name]", "Test Donation")
    formData.append("line_items[0][price_data][product_data][description]", "Test Momentum donation")
    formData.append("line_items[0][price_data][unit_amount]", "500") // $5.00
    formData.append("line_items[0][quantity]", "1")
    formData.append("mode", "payment")
    formData.append("success_url", `${origin}/about?test=success`)
    formData.append("cancel_url", `${origin}/about?test=cancelled`)

    console.log("📡 Making test API call to Stripe...")

    const response = await fetch(stripeApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    console.log("📡 Test response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Test failed:", errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      return NextResponse.json({
        success: false,
        error: errorData.error?.message || errorData.message || "Unknown error",
        details: errorText,
      })
    }

    const session = await response.json()

    console.log("✅ Test Stripe session created:", session.id)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: "✅ Stripe is working! Session created successfully using direct API.",
      testAmount: "$5.00",
      method: "Direct REST API (no Node.js library required)",
    })
  } catch (error) {
    console.error("❌ Stripe test failed:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: "Check server logs for more details",
    })
  }
}
