import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 DIAGNOSING EVENTS API ISSUES...")

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

    // Fetch records from Airtable
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
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

    console.log(`📊 Found ${records.length} total records in Airtable`)

    // Analyze each record
    const analysis = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const record of records) {
      const fields = record.fields

      // Parse date
      let parsedDate = null
      let dateParseMethod = "none"
      if (fields.Date) {
        if (fields.Date.includes("/")) {
          // Handle MM/DD/YYYY format
          const [month, day, year] = fields.Date.split("/")
          if (month && day && year) {
            parsedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
            dateParseMethod = "MM/DD/YYYY"
          }
        } else {
          // Assume YYYY-MM-DD format
          parsedDate = fields.Date
          dateParseMethod = "YYYY-MM-DD"
        }
      }

      // Determine if upcoming
      let isUpcoming = false
      let eventDate = null
      if (parsedDate) {
        eventDate = new Date(parsedDate + "T00:00:00")
        isUpcoming = eventDate >= today
      }

      const recordAnalysis = {
        id: record.id,
        title: fields.Title || "No Title",
        originalDate: fields.Date,
        parsedDate,
        dateParseMethod,
        eventDate: eventDate ? eventDate.toISOString() : null,
        isUpcoming,
        daysDifference: eventDate ? Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null,
        isHidden: fields.Not_Shown === true,
        friend: fields.Friend_Name,
        venue: fields.Venue,
        eventType: fields.Event_Type,
      }

      analysis.push(recordAnalysis)

      // Log specific events we're looking for
      if (
        fields.Title &&
        (fields.Title.toLowerCase().includes("spree") || fields.Title.toLowerCase().includes("sektgarten"))
      ) {
        console.log(`🎯 FOUND TARGET EVENT: ${fields.Title}`, recordAnalysis)
      }
    }

    // Sort by date for easier analysis
    analysis.sort((a, b) => {
      if (!a.eventDate && !b.eventDate) return 0
      if (!a.eventDate) return 1
      if (!b.eventDate) return -1
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    })

    // Summary stats
    const stats = {
      totalRecords: records.length,
      withDates: analysis.filter((r) => r.parsedDate).length,
      withoutDates: analysis.filter((r) => !r.parsedDate).length,
      upcoming: analysis.filter((r) => r.isUpcoming).length,
      past: analysis.filter((r) => r.parsedDate && !r.isUpcoming).length,
      hidden: analysis.filter((r) => r.isHidden).length,
      visible: analysis.filter((r) => !r.isHidden).length,
      todayDate: today.toISOString().split("T")[0],
    }

    // Find the specific events mentioned
    const spreeEvent = analysis.find((r) => r.title.toLowerCase().includes("spree"))
    const sektgartenEvent = analysis.find((r) => r.title.toLowerCase().includes("sektgarten"))

    return NextResponse.json({
      success: true,
      stats,
      targetEvents: {
        spreeEvent,
        sektgartenEvent,
      },
      recentEvents: analysis.slice(0, 10), // First 10 events by date
      upcomingEvents: analysis.filter((r) => r.isUpcoming).slice(0, 5),
      pastEvents: analysis.filter((r) => r.parsedDate && !r.isUpcoming).slice(-5), // Last 5 past events
      allEvents: analysis, // Full analysis for debugging
    })
  } catch (error) {
    console.error("💥 Error in events diagnosis:", error)
    return NextResponse.json(
      {
        error: "Diagnosis failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
