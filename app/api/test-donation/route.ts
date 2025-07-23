import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        error: "Stripe not configured",
      })
    }

    console.log("🧪 Testing full donation flow...")

    const stripe = require("stripe")(stripeSecretKey)

    // Create a test checkout session for $1
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Momentum Donation (Test)",
              description: "Test donation to verify Stripe integration",
            },
            unit_amount: 100, // $1.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/about?donation=success&test=true`,
      cancel_url: `${request.headers.get("origin")}/about?donation=cancelled&test=true`,
      metadata: {
        product: "momentum_donation_test",
        environment: "production_test",
      },
    })

    console.log("✅ Test donation session created:", session.id)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: "✅ Stripe is fully working! Test donation session created.",
      amount: "$1.00",
      mode: "live",
      note: "This will create a real $1 charge if completed",
    })
  } catch (error) {
    console.error("❌ Donation test failed:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: "Check server logs for more details",
    })
  }
}
