import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    console.log("🔍 Payment Intent Request:", {
      amount,
      amountInCents: amount,
      amountInDollars: amount / 100,
      timestamp: new Date().toISOString(),
    })

    // Validate amount
    if (!amount || amount < 100) {
      console.error("❌ Invalid amount:", amount)
      return NextResponse.json({ error: "Invalid amount. Minimum donation is $1.00" }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    console.log("🔍 Stripe Environment Check:", {
      hasStripeKey: !!stripeSecretKey,
      keyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 8) + "..." : "missing",
      keyType: stripeSecretKey?.includes("test") ? "test" : "live",
    })

    if (!stripeSecretKey) {
      console.error("❌ Missing STRIPE_SECRET_KEY environment variable")
      return NextResponse.json({
        error: "Stripe not configured",
        simulated: true,
        clientSecret: "sim_" + Date.now(),
      })
    }

    try {
      // Get the origin for redirect URLs
      const origin = request.headers.get("origin") || "https://momentum.thedscs.com"
      console.log("🌐 Using origin for redirects:", origin)

      console.log("💳 Creating Stripe Checkout Session via API...")

      // Use Stripe's REST API directly instead of the Node.js library
      const stripeApiUrl = "https://api.stripe.com/v1/checkout/sessions"

      // Prepare form data for Stripe API
      const formData = new URLSearchParams()
      formData.append("payment_method_types[]", "card")
      formData.append("line_items[0][price_data][currency]", "usd")
      formData.append("line_items[0][price_data][product_data][name]", "Momentum Donation")
      formData.append(
        "line_items[0][price_data][product_data][description]",
        "Support Momentum's development - helping creative communities stay connected",
      )
      formData.append("line_items[0][price_data][unit_amount]", amount.toString())
      formData.append("line_items[0][quantity]", "1")
      formData.append("mode", "payment")
      formData.append("success_url", `${origin}/about?donation=success&session_id={CHECKOUT_SESSION_ID}`)
      formData.append("cancel_url", `${origin}/about?donation=cancelled`)
      formData.append("metadata[product]", "momentum_donation")
      formData.append("metadata[amount_dollars]", (amount / 100).toString())
      formData.append("metadata[timestamp]", new Date().toISOString())
      formData.append("customer_creation", "always")
      formData.append("billing_address_collection", "auto")

      console.log("📡 Making direct API call to Stripe...")

      const response = await fetch(stripeApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      console.log("📡 Stripe API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Stripe API error response:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { message: errorText }
        }

        return NextResponse.json(
          {
            error: "Stripe API error: " + (errorData.error?.message || errorData.message || "Unknown error"),
            details: errorData.error?.type || "api_error",
            code: errorData.error?.code || "stripe_api_error",
          },
          { status: 500 },
        )
      }

      const session = await response.json()

      console.log("✅ Stripe Checkout Session created successfully:", {
        sessionId: session.id,
        url: session.url,
        amount: amount,
        amountDollars: amount / 100,
      })

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        message: "Checkout session created successfully",
        amount: amount,
        amountDollars: amount / 100,
      })
    } catch (stripeError) {
      console.error("❌ Stripe API error:", {
        message: stripeError.message,
        stack: stripeError.stack,
      })

      return NextResponse.json(
        {
          error: "Stripe error: " + stripeError.message,
          details: "fetch_error",
          code: "stripe_fetch_error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("💥 Payment intent creation failed:", {
      message: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
