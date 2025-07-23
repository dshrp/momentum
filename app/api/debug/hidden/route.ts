import { NextResponse } from "next/server"

export async function GET() {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    if (!baseId || !tableId || !apiKey) {
      return NextResponse.json({ error: "Missing environment variables" })
    }

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`

    const response = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`)
    }

    const data = await response.json()

    // Get all field names
    const fieldNames = data.records.length > 0 ? Object.keys(data.records[0].fields) : []

    // Check for Not_Shown field variations
    const hiddenFieldVariations = fieldNames.filter(
      (field) =>
        field.toLowerCase().includes("not_shown") ||
        field.toLowerCase().includes("notshown") ||
        field.toLowerCase().includes("hidden") ||
        field.toLowerCase().includes("hide"),
    )

    // Analyze Not_Shown field
    const hiddenAnalysis = data.records.map((record: any) => ({
      id: record.id,
      title: record.fields.Title || record.fields.Event_Title || "No title",
      notShown: record.fields.Not_Shown,
      notShownType: typeof record.fields.Not_Shown,
      allHiddenFields: Object.keys(record.fields).filter(
        (key) => key.toLowerCase().includes("not_shown") || key.toLowerCase().includes("hidden"),
      ),
    }))

    const hiddenEvents = hiddenAnalysis.filter(
      (event) => event.notShown === true || event.notShown === "true" || event.notShown === 1,
    )

    return NextResponse.json({
      status: "Debug Report",
      airtableConnection: "✅ Connected",
      totalEvents: data.records.length,

      // Field Analysis
      allFieldNames: fieldNames,
      hasNotShownField: fieldNames.includes("Not_Shown"),
      hiddenFieldVariations: hiddenFieldVariations,

      // Hidden Events Analysis
      hiddenEvents: hiddenEvents.length,
      hiddenEventDetails: hiddenEvents,

      // Recommendations
      recommendations: {
        needsNotShownField: !fieldNames.includes("Not_Shown"),
        suggestedAction: !fieldNames.includes("Not_Shown")
          ? "❌ Add a 'Not_Shown' checkbox field to your Airtable Events table"
          : "✅ Not_Shown field exists - hide functionality should work",
        fieldToAdd: {
          name: "Not_Shown",
          type: "Checkbox",
          description: "Add this field to your Airtable Events table to enable hide functionality",
        },
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
