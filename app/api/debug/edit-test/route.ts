import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { eventId, testData } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    console.log("🧪 Testing edit functionality:", {
      eventId,
      hasBaseId: !!baseId,
      hasTableId: !!tableId,
      hasApiKey: !!apiKey,
      testData,
    })

    if (!baseId || !tableId || !apiKey) {
      throw new Error("Missing Airtable environment variables")
    }

    // First, let's get the current record to see its structure
    const getUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${eventId}`
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!getResponse.ok) {
      const errorText = await getResponse.text()
      return NextResponse.json({
        success: false,
        error: `Failed to fetch record: ${getResponse.status}`,
        details: errorText,
      })
    }

    const currentRecord = await getResponse.json()
    console.log("📋 Current record structure:", {
      id: currentRecord.id,
      fields: Object.keys(currentRecord.fields),
      locationField: currentRecord.fields.Location,
      venueField: currentRecord.fields.Venue,
    })

    // Now test a simple update
    const updatePayload = {
      fields: testData || {
        Location: "Chicago, IL",
        "User Updated": true,
        "Last User Updated": new Date().toISOString().split("T")[0],
        "User Update Fields": "Location",
      },
    }

    console.log("📝 Testing update with payload:", updatePayload)

    const updateUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${eventId}`
    const updateResponse = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    })

    console.log("📡 Update response status:", updateResponse.status)

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error("❌ Update failed:", errorText)

      return NextResponse.json({
        success: false,
        error: `Update failed: ${updateResponse.status}`,
        details: errorText,
        currentRecord: currentRecord.fields,
        attemptedUpdate: updatePayload,
      })
    }

    const updatedRecord = await updateResponse.json()
    console.log("✅ Update successful:", updatedRecord.id)

    return NextResponse.json({
      success: true,
      message: "Edit test successful!",
      before: currentRecord.fields,
      after: updatedRecord.fields,
      changes: updatePayload.fields,
    })
  } catch (error) {
    console.error("💥 Edit test error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
