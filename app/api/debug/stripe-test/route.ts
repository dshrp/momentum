import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    console.log("🔍 Stripe Debug Check:", {
      hasSecretKey: !!stripeSecretKey,
      hasPublishableKey: !!stripePublishableKey,
      secretKeyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 8) + "..." : "missing",
      publishableKeyPrefix: stripePublishableKey ? stripePublishableKey.substring(0, 8) + "..." : "missing",
      secretKeyType: stripeSecretKey?.includes("test")
        ? "test"
        : stripeSecretKey?.includes("live")
          ? "live"
          : "unknown",
      publishableKeyType: stripePublishableKey?.includes("test")
        ? "test"
        : stripePublishableKey?.includes("live")
          ? "live"
          : "unknown",
    })

    if (!stripeSecretKey) {
      return NextResponse.json({
        status: "error",
        message: "STRIPE_SECRET_KEY environment variable is missing",
        hasSecretKey: false,
        hasPublishableKey: !!stripePublishableKey,
      })
    }

    if (!stripePublishableKey) {
      return NextResponse.json({
        status: "warning",
        message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is missing",
        hasSecretKey: true,
        hasPublishableKey: false,
      })
    }

    // Test Stripe API connection
    try {
      const testResponse = await fetch("https://api.stripe.com/v1/payment_methods", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      const apiWorking = testResponse.status === 200 || testResponse.status === 400 // 400 is expected for this endpoint without params

      return NextResponse.json({
        status: "success",
        message: "Stripe configuration looks good!",
        hasSecretKey: true,
        hasPublishableKey: true,
        apiConnection: apiWorking ? "working" : "failed",
        testResponseStatus: testResponse.status,
        keyTypes: {
          secret: stripeSecretKey?.includes("test") ? "test" : "live",
          publishable: stripePublishableKey?.includes("test") ? "test" : "live",
        },
      })
    } catch (apiError) {
      return NextResponse.json({
        status: "error",
        message: "Failed to connect to Stripe API",
        hasSecretKey: true,
        hasPublishableKey: true,
        apiConnection: "failed",
        error: apiError.message,
      })
    }
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({
      status: "error",
      message: "Debug check failed",
      error: error.message,
    })
  }
}
