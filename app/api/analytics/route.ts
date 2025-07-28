import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const gaId = process.env.NEXT_PUBLIC_GA_ID

    return NextResponse.json({
      analytics: {
        enabled: !!gaId,
        gaId: gaId ? `${gaId.substring(0, 5)}...` : null, // Partially hide for security
        status: gaId ? "configured" : "not_configured",
      },
      instructions: {
        setup: [
          "1. Get your Google Analytics 4 Measurement ID (starts with G-)",
          "2. Add NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX to your environment variables",
          "3. Deploy the changes",
          "4. Analytics will automatically start tracking",
        ],
        features: [
          "Automatic page view tracking",
          "Custom event tracking for user interactions",
          "Conversion tracking for donations and signups",
          "Source management tracking",
          "Event engagement metrics",
        ],
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to get analytics status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { event, category, label, value } = await request.json()

    // Log analytics events server-side for debugging
    console.log("📊 Analytics Event:", {
      event,
      category,
      label,
      value,
      timestamp: new Date().toISOString(),
      gaEnabled: !!process.env.NEXT_PUBLIC_GA_ID,
    })

    return NextResponse.json({
      success: true,
      logged: true,
      gaEnabled: !!process.env.NEXT_PUBLIC_GA_ID,
    })
  } catch (error) {
    console.error("Analytics logging error:", error)
    return NextResponse.json({ error: "Failed to log analytics event" }, { status: 500 })
  }
}
