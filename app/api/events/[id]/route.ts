import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    console.log("🔄 PATCH request received:", {
      eventId: id,
      updates: updates,
      notShownValue: updates.Not_Shown,
      notShownType: typeof updates.Not_Shown,
    })

    // Get environment variables
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    // Check if all required environment variables are present
    if (!baseId || !tableId || !apiKey) {
      console.error("Missing environment variables for PATCH:", {
        hasBaseId: !!baseId,
        hasTableId: !!tableId,
        hasApiKey: !!apiKey,
      })
      throw new Error("Missing required Airtable environment variables")
    }

    // Prepare the update payload for Airtable
    const updatePayload = {
      fields: {
        ...updates,
        // Add metadata about the user update
        "User Updated": true,
        "Last User Updated": new Date().toISOString().split("T")[0], // Date only format
        "User Update Fields": Object.keys(updates).join(", "),
      },
    }

    console.log("📝 Sending to Airtable:", {
      id,
      baseId,
      tableId,
      updateFields: Object.keys(updates),
      notShownValue: updates.Not_Shown,
      fullPayload: updatePayload,
    })

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`

    const response = await fetch(airtableUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    })

    console.log("📡 Airtable PATCH response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Airtable PATCH error:", errorText)

      let errorDetails = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorDetails = errorJson.error?.message || errorJson.message || errorText
      } catch (e) {
        // Keep original error text if not JSON
      }

      throw new Error(`Airtable API error: ${response.status} - ${response.statusText}. Details: ${errorDetails}`)
    }

    const updatedRecord = await response.json()
    console.log("✅ Successfully updated Airtable record:", {
      recordId: updatedRecord.id,
      notShownFieldInResponse: updatedRecord.fields?.Not_Shown,
      allFields: Object.keys(updatedRecord.fields || {}),
    })

    return NextResponse.json({ success: true, record: updatedRecord })
  } catch (error) {
    console.error("💥 Error updating event in Airtable:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update event",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
