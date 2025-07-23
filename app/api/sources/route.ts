import { NextResponse } from "next/server"
import { baseId, apiKey, sourcesTableId } from "@/config/airtable"

export async function POST(request: Request) {
  try {
    const { platform, username, friendName } = await request.json()

    // Validate input
    if (!platform || !username || !friendName) {
      return NextResponse.json({ error: "Missing required fields: platform, username, friendName" }, { status: 400 })
    }

    if (!baseId || !apiKey || !sourcesTableId) {
      console.error("❌ Missing Airtable environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "Missing Airtable configuration",
        },
        { status: 500 },
      )
    }

    const cleanUsername = username.replace("@", "").toLowerCase()

    console.log("🚀 Adding source to Airtable:", {
      platform,
      username: cleanUsername,
      friendName,
    })

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${sourcesTableId}`

    // Remove computed fields - only send fields we can actually set
    const requestBody = {
      fields: {
        Friend_Name: friendName,
        Platform: platform,
        Username: cleanUsername,
        Status: "Active",
        Active: true,
        Instagram_Handle: platform === "Instagram" ? cleanUsername : null,
        RSS_URL: platform === "Instagram" ? `https://rsshub.app/instagram/user/${cleanUsername}` : null,
        Events_Found: 0,
        // Removed Date_Added (computed field)
        // Removed Last_Checked (will be null anyway)
      },
    }

    console.log("📝 Request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("📡 Airtable response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Airtable API error:", {
        status: response.status,
        error: errorText,
      })

      let errorDetails = errorText
      try {
        const parsedError = JSON.parse(errorText)
        errorDetails = parsedError.error?.message || parsedError.message || errorText
      } catch (e) {
        // Keep original error text
      }

      return NextResponse.json(
        {
          success: false,
          error: `Airtable API error: ${response.status}`,
          details: errorDetails,
        },
        { status: 500 },
      )
    }

    const sourceRecord = await response.json()
    console.log("✅ Source added successfully:", sourceRecord.id)

    return NextResponse.json({
      success: true,
      message: `Successfully added ${friendName}'s ${platform} account!`,
      recordId: sourceRecord.id,
      details: {
        platform,
        username: cleanUsername,
        friendName,
        status: "monitoring",
        rssUrl: platform === "Instagram" ? `https://rsshub.app/instagram/user/${cleanUsername}` : null,
      },
    })
  } catch (error) {
    console.error("💥 Unexpected error adding source:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add source",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    if (!baseId || !apiKey || !sourcesTableId) {
      return NextResponse.json({
        sources: [{ name: "Instagram", count: 5, status: "connected" }],
        mockMode: true,
      })
    }

    // Get sources from Sources table
    const sourcesUrl = `https://api.airtable.com/v0/${baseId}/${sourcesTableId}?filterByFormula=Active=TRUE()`
    const sourcesResponse = await fetch(sourcesUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!sourcesResponse.ok) {
      throw new Error(`Failed to fetch sources: ${sourcesResponse.status}`)
    }

    const sourcesData = await sourcesResponse.json()

    // Get events from Events table to count events per friend
    const eventsTableId = process.env.AIRTABLE_TABLE_ID
    let eventsData = { records: [] }

    if (eventsTableId) {
      try {
        const eventsUrl = `https://api.airtable.com/v0/${baseId}/${eventsTableId}`
        const eventsResponse = await fetch(eventsUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        })

        if (eventsResponse.ok) {
          eventsData = await eventsResponse.json()
        }
      } catch (error) {
        console.warn("Could not fetch events for counting:", error)
      }
    }

    // Count events per friend
    const eventCountsByFriend = {}
    eventsData.records.forEach((event) => {
      const friendName = event.fields.Friend_Name || event.fields.Artist || event.fields.DJ || event.fields.Creator
      if (friendName) {
        eventCountsByFriend[friendName] = (eventCountsByFriend[friendName] || 0) + 1
      }
    })

    console.log("📊 Event counts by friend:", eventCountsByFriend)

    // Group sources by platform and add real event counts
    const sourcesByPlatform = sourcesData.records.reduce((acc: any, record: any) => {
      const platform = record.fields.Platform || "Instagram"
      if (!acc[platform]) {
        acc[platform] = { name: platform, count: 0, status: "connected", sources: [] }
      }
      acc[platform].count++

      const friendName = record.fields.Friend_Name
      const realEventCount = eventCountsByFriend[friendName] || 0

      acc[platform].sources.push({
        id: record.id,
        friendName: friendName,
        username: record.fields.Username,
        dateAdded: record.fields.Date_Added,
        rssUrl: record.fields.RSS_URL,
        eventsFound: realEventCount, // Use real count from Events table
        lastChecked: record.fields.Last_Checked,
      })
      return acc
    }, {})

    console.log("✅ Sources with real event counts:", Object.keys(sourcesByPlatform))

    return NextResponse.json({
      sources: Object.values(sourcesByPlatform),
      success: true,
      totalSources: sourcesData.records.length,
      totalEvents: Object.values(eventCountsByFriend).reduce((sum: number, count: number) => sum + count, 0),
    })
  } catch (error) {
    console.error("Error fetching sources:", error)
    return NextResponse.json({
      sources: [{ name: "Instagram", count: 5, status: "connected" }],
      mockMode: true,
      error: error.message,
    })
  }
}
