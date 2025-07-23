import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    if (!baseId || !tableId || !apiKey) {
      throw new Error("Missing environment variables")
    }

    // Test payload to hide an event
    const testPayload = {
      fields: {
        Not_Shown: true,
        "User Updated": true,
        "Last User Updated": new Date().toISOString().split("T")[0],
        "User Update Fields": "Not_Shown",
      },
    }

    console.log("🧪 Testing hide functionality:", {
      eventId,
      payload: testPayload,
    })

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${eventId}`

    const response = await fetch(airtableUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    })

    console.log("📡 Test response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Test failed:", errorText)

      return NextResponse.json({
        success: false,
        error: `Airtable error: ${response.status}`,
        details: errorText,
      })
    }

    const result = await response.json()
    console.log("✅ Test successful:", result)

    return NextResponse.json({
      success: true,
      message: "Event successfully hidden!",
      result: result,
      notShownValue: result.fields?.Not_Shown,
    })
  } catch (error) {
    console.error("💥 Test error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
