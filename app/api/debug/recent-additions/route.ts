import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Checking for recent additions to Airtable...")

    // Get environment variables
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    if (!baseId || !tableId || !apiKey) {
      return NextResponse.json({
        error: "Missing environment variables",
        details: { hasBaseId: !!baseId, hasTableId: !!tableId, hasApiKey: !!apiKey },
      })
    }

    // Fetch records sorted by creation time (most recent first)
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)
    url.searchParams.set("sort[0][field]", "Created")
    url.searchParams.set("sort[0][direction]", "desc")
    url.searchParams.set("maxRecords", "20") // Get last 20 records

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        error: "Airtable API error",
        details: errorText,
        status: response.status,
      })
    }

    const data = await response.json()
    const records = data.records || []

    console.log(`📊 Found ${records.length} most recent records`)

    // Process recent records
    const recentRecords = records.map((record) => {
      const fields = record.fields
      return {
        id: record.id,
        createdTime: record.createdTime,
        title: fields.Title || "No Title",
        friend: fields.Friend_Name || "",
        date: fields.Date || "",
        venue: fields.Venue || "",
        eventType: fields.Event_Type || "",
        isHidden: fields.Not_Shown === true,
        eventId: fields.Event_ID,
        sourceUrl: fields.Source_URL || "",
        description: fields.Description || "",
      }
    })

    // Look for specific events in recent records
    const spreeEvents = recentRecords.filter((r) => r.title.toLowerCase().includes("spree"))
    const sektgartenEvents = recentRecords.filter((r) => r.title.toLowerCase().includes("sektgarten"))

    return NextResponse.json({
      success: true,
      totalRecentRecords: records.length,
      recentRecords,
      targetEvents: {
        spreeEvents,
        sektgartenEvents,
      },
      last24Hours: recentRecords.filter((r) => {
        const createdTime = new Date(r.createdTime)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return createdTime >= yesterday
      }),
    })
  } catch (error) {
    console.error("💥 Error checking recent additions:", error)
    return NextResponse.json(
      {
        error: "Recent additions check failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
