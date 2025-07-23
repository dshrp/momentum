import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    return NextResponse.json({
      environment: {
        hasSecretKey: !!stripeSecretKey,
        hasPublishableKey: !!stripePublishableKey,
        secretKeyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 8) + "..." : "missing",
        publishableKeyPrefix: stripePublishableKey ? stripePublishableKey.substring(0, 8) + "..." : "missing",
        secretKeyFormat: stripeSecretKey ? (stripeSecretKey.startsWith("sk_") ? "correct" : "wrong format") : "missing",
        publishableKeyFormat: stripePublishableKey
          ? stripePublishableKey.startsWith("pk_")
            ? "correct"
            : "wrong format"
          : "missing",
      },
      recommendations: {
        secretKey: !stripeSecretKey ? "Add STRIPE_SECRET_KEY environment variable" : "✅ Secret key found",
        publishableKey: !stripePublishableKey
          ? "Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable"
          : "✅ Publishable key found",
        testMode: stripeSecretKey?.includes("test") ? "Using test mode (good for development)" : "Using live mode",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
