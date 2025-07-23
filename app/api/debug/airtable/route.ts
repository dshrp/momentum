import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get environment variables
    const baseId = process.env.AIRTABLE_BASE_ID
    const apiKey = process.env.AIRTABLE_API_KEY
    const sourcesTableId = process.env.AIRTABLE_SOURCES_TABLE_ID
    const eventsTableId = process.env.AIRTABLE_TABLE_ID

    // Expected values from your URL
    const expectedBaseId = "appN08htGqpgueEKC"
    const expectedSourcesTableId = "tblb85Zc7OheRKCWH"

    // Test connection to Sources table
    let connectionTest = null
    let connectionError = null

    if (baseId && apiKey && sourcesTableId) {
      try {
        const testUrl = `https://api.airtable.com/v0/${baseId}/${sourcesTableId}?maxRecords=1`
        const response = await fetch(testUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          connectionTest = {
            success: true,
            recordCount: data.records?.length || 0,
            status: response.status,
          }
        } else {
          const errorText = await response.text()
          connectionTest = {
            success: false,
            status: response.status,
            error: errorText,
          }
        }
      } catch (err) {
        connectionError = err.message
      }
    }

    return NextResponse.json({
      environmentCheck: {
        // Environment variables status
        hasBaseId: !!baseId,
        hasApiKey: !!apiKey,
        hasSourcesTableId: !!sourcesTableId,
        hasEventsTableId: !!eventsTableId,

        // Values (safely showing prefixes)
        baseId: baseId || "missing",
        sourcesTableId: sourcesTableId || "missing",
        apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + "..." : "missing",

        // Validation against expected values
        baseIdCorrect: baseId === expectedBaseId,
        sourcesTableIdCorrect: sourcesTableId === expectedSourcesTableId,

        // Expected vs actual
        expectedBaseId,
        expectedSourcesTableId,

        // Connection test results
        connectionTest,
        connectionError,

        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
