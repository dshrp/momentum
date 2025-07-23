import { NextResponse } from "next/server"

export async function GET() {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    if (!baseId || !tableId || !apiKey) {
      return NextResponse.json({ error: "Missing environment variables" })
    }

    // First, let's get all tables in the base
    const baseInfoUrl = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`

    const baseInfoResponse = await fetch(baseInfoUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    let allTables = []
    if (baseInfoResponse.ok) {
      const baseInfo = await baseInfoResponse.json()
      allTables = baseInfo.tables || []
    }

    // Now let's check what we're actually hitting
    const currentTableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=1`

    const currentTableResponse = await fetch(currentTableUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    let currentTableData = null
    let currentTableFields = []

    if (currentTableResponse.ok) {
      currentTableData = await currentTableResponse.json()
      if (currentTableData.records && currentTableData.records.length > 0) {
        currentTableFields = Object.keys(currentTableData.records[0].fields)
      }
    }

    // Find the Events table specifically
    const eventsTable = allTables.find((table) => table.name.toLowerCase().includes("event") || table.id === tableId)

    return NextResponse.json({
      status: "Table Debug Report",
      environment: {
        baseId: baseId,
        tableId: tableId,
        apiKeyPrefix: apiKey.substring(0, 8) + "...",
      },

      allTablesInBase: allTables.map((table) => ({
        id: table.id,
        name: table.name,
        isCurrentTable: table.id === tableId,
      })),

      currentTableBeingUsed: {
        id: tableId,
        name: allTables.find((t) => t.id === tableId)?.name || "Unknown",
        fields: currentTableFields,
        hasNotShownField: currentTableFields.includes("Not_Shown"),
        recordCount: currentTableData?.records?.length || 0,
      },

      eventsTableInfo: eventsTable
        ? {
            id: eventsTable.id,
            name: eventsTable.name,
            isBeingUsed: eventsTable.id === tableId,
            fields:
              eventsTable.fields?.map((f) => ({
                name: f.name,
                type: f.type,
              })) || [],
          }
        : null,

      recommendations: {
        correctTableId: eventsTable?.id,
        needsTableIdUpdate: eventsTable && eventsTable.id !== tableId,
        suggestedAction:
          eventsTable && eventsTable.id !== tableId
            ? `Update AIRTABLE_TABLE_ID to: ${eventsTable.id}`
            : "Table ID appears correct, check field names",
      },

      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
