import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("q") || ""

    console.log(`🔍 Searching for events containing: "${searchTerm}"`)

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
        const errorText = await response.text()
        return NextResponse.json({
          error: "Airtable API error",
          details: errorText,
          status: response.status,
        })
      }

      const data = await response.json()
      allRecords = allRecords.concat(data.records)
      offset = data.offset
    } while (offset)

    console.log(`📊 Searching through ${allRecords.length} total records`)

    // Search through all records
    const matchingRecords = []
    const searchTermLower = searchTerm.toLowerCase()

    for (const record of allRecords) {
      const fields = record.fields
      const title = (fields.Title || "").toLowerCase()
      const description = (fields.Description || "").toLowerCase()
      const friend = (fields.Friend_Name || "").toLowerCase()
      const venue = (fields.Venue || "").toLowerCase()

      // Check if search term appears in any field
      if (
        title.includes(searchTermLower) ||
        description.includes(searchTermLower) ||
        friend.includes(searchTermLower) ||
        venue.includes(searchTermLower)
      ) {
        matchingRecords.push({
          id: record.id,
          title: fields.Title || "No Title",
          description: fields.Description || "",
          friend: fields.Friend_Name || "",
          venue: fields.Venue || "",
          date: fields.Date || "",
          time: fields.Time || "",
          location: fields.Location || "",
          eventType: fields.Event_Type || "",
          sourceUrl: fields.Source_URL || "",
          isHidden: fields.Not_Shown === true,
          userUpdated: fields.User_Updated === true,
          eventId: fields.Event_ID,
          allFields: fields, // Include all fields for debugging
        })
      }
    }

    console.log(`✅ Found ${matchingRecords.length} matching records`)

    return NextResponse.json({
      success: true,
      searchTerm,
      totalRecords: allRecords.length,
      matchingRecords,
      matchCount: matchingRecords.length,
    })
  } catch (error) {
    console.error("💥 Error in search:", error)
    return NextResponse.json(
      {
        error: "Search failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
