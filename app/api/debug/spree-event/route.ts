import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Debug: Searching for Spree-side event...")

    // Get environment variables
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    if (!baseId || !tableId || !apiKey) {
      throw new Error("Missing required Airtable environment variables")
    }

    // Fetch ALL records from Airtable with pagination
    let allRecords = []
    let offset = null

    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)
      if (offset) {
        url.searchParams.set("offset", offset)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`)
      }

      const data = await response.json()
      allRecords = allRecords.concat(data.records)
      offset = data.offset
    } while (offset)

    console.log(`📊 Total records fetched: ${allRecords.length}`)

    // Search for the Spree-side event by multiple criteria
    const searchTerms = ["spree", "boogie", "berliner", "vagabund", "museuminsel", "berlin"]
    const candidates = allRecords.filter((record) => {
      const title = record.fields.Title?.toLowerCase() || ""
      const description = record.fields.Description?.toLowerCase() || ""
      const venue = record.fields.Venue?.toLowerCase() || ""
      const location = record.fields.Location?.toLowerCase() || ""
      const eventId = record.fields.Event_ID

      // Check if it's Event_ID 550 specifically
      if (eventId === 550) return true

      // Check if any search terms match
      const allText = `${title} ${description} ${venue} ${location}`
      return searchTerms.some((term) => allText.includes(term))
    })

    // Also search for events with the specific date
    const dateMatches = allRecords.filter((record) => {
      const date = record.fields.Date
      return date === "7/12/2025" || date === "2025-07-12"
    })

    if (candidates.length === 0 && dateMatches.length === 0) {
      return NextResponse.json({
        error: "No matching events found",
        totalRecords: allRecords.length,
        searchedFor: searchTerms,
        allTitles: allRecords.map((r) => r.fields.Title || "No Title"),
        sampleRecords: allRecords.slice(0, 3).map((r) => ({ id: r.id, fields: r.fields })),
      })
    }

    // Analyze the candidates
    const analysis = [...candidates, ...dateMatches].map((record) => {
      const fields = record.fields

      // Parse the date
      let parsedDate = null
      let isUpcoming = false
      const dateParsingSteps = []

      if (fields.Date) {
        dateParsingSteps.push(`Original date: ${fields.Date}`)

        // Handle MM/DD/YYYY format
        if (fields.Date.includes("/")) {
          const [month, day, year] = fields.Date.split("/")
          if (month && day && year) {
            parsedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
            dateParsingSteps.push(`Converted MM/DD/YYYY to: ${parsedDate}`)
          }
        } else {
          parsedDate = fields.Date
          dateParsingSteps.push(`Used as-is: ${parsedDate}`)
        }

        if (parsedDate) {
          const eventDate = new Date(parsedDate + "T00:00:00")
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          isUpcoming = eventDate >= today
          dateParsingSteps.push(`Is upcoming: ${isUpcoming}`)
        }
      }

      return {
        id: record.id,
        eventId: fields.Event_ID,
        title: fields.Title,
        friend: fields.Friend_Name,
        type: fields.Event_Type,
        originalDate: fields.Date,
        parsedDate,
        isUpcoming,
        dateParsingSteps,
        time: fields.Time,
        venue: fields.Venue,
        location: fields.Location,
        description: fields.Description,
        sourceUrl: fields.Source_URL,
        notShown: fields.Not_Shown,
        wouldBeIncluded: !fields.Not_Shown && parsedDate,
        allFields: Object.keys(fields),
      }
    })

    return NextResponse.json({
      success: true,
      totalRecords: allRecords.length,
      candidatesFound: analysis.length,
      analysis,
    })
  } catch (error) {
    console.error("❌ Debug error:", error)
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    )
  }
}
