import { NextResponse } from "next/server"

export async function GET() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return NextResponse.json({
    status: gaId ? "configured" : "not_configured",
    ga_id: gaId ? `${gaId.substring(0, 4)}...` : null,
    message: gaId
      ? "Google Analytics is properly configured and tracking events"
      : "Add NEXT_PUBLIC_GA_ID environment variable to enable tracking",
    features: {
      page_views: "Automatic tracking of all page visits",
      event_interactions: "View, edit, hide, and calendar events",
      user_actions: "Refresh, add sources, navigation",
      conversions: "Waitlist signups, contact forms, donations",
      error_tracking: "Automatic error and exception tracking",
    },
    setup_instructions: {
      step_1: "Get your Google Analytics 4 Measurement ID (starts with G-)",
      step_2: "Add NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX to your environment variables",
      step_3: "Deploy your changes",
      step_4: "Visit your site and check Google Analytics Real-time reports",
    },
  })
}
