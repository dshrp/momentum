import { NextResponse } from "next/server"

export async function GET() {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    if (!baseId || !tableId || !apiKey) {
      return NextResponse.json({ error: "Missing environment variables" })
    }

    // Get a few records to analyze field structure
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=3`

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

    // Analyze field mapping
    const fieldAnalysis = {}
    const allFields = new Set()

    data.records.forEach((record) => {
      Object.keys(record.fields).forEach((field) => allFields.add(field))
    })

    // Check for location-related fields specifically
    const locationFields = Array.from(allFields).filter(
      (field) =>
        field.toLowerCase().includes("location") ||
        field.toLowerCase().includes("venue") ||
        field.toLowerCase().includes("city") ||
        field.toLowerCase().includes("state"),
    )

    // Sample record for field mapping
    const sampleRecord = data.records[0]

    return NextResponse.json({
      status: "Field Mapping Analysis",
      totalRecords: data.records.length,
      allFields: Array.from(allFields).sort(),
      locationRelatedFields: locationFields,
      sampleRecord: {
        id: sampleRecord.id,
        fields: sampleRecord.fields,
      },
      editFormMapping: {
        "Form Field": "Airtable Field",
        Title: "Title or Event_Title or Event_Name",
        Time: "Time or Event_Time or Start_Time",
        Date: "Date or Event_Date or Event_Day",
        Venue: "Venue or Location_Name",
        Location: "Location or City or Area",
        Description: "Description or Event_Description or Caption",
        Event_Type: "Event_Type or Type or Category",
      },
      recommendations: {
        checkFieldNames: "Verify edit form field names match Airtable exactly",
        caseSensitive: "Airtable field names are case-sensitive",
        testWithSampleRecord: `Use /api/debug/edit-test with eventId: ${sampleRecord.id}`,
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
