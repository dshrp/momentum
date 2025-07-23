import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🧹 Manual cache clear requested")

    // Return success with cache-busting headers
    return NextResponse.json(
      {
        success: true,
        message: "Cache cleared successfully",
        timestamp: new Date().toISOString(),
        cacheBuster: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      },
    )
  } catch (error) {
    console.error("❌ Cache clear error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST() // Allow GET requests too for easy testing
}
