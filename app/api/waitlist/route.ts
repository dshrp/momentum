import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields: name, email" }, { status: 400 })
    }

    const baseId = process.env.AIRTABLE_BASE_ID
    const apiKey = process.env.AIRTABLE_API_KEY
    const emailsTableId = process.env.AIRTABLE_EMAILS_TABLE_ID || "tbl7WInMJQYpIj9VI"

    if (!baseId || !apiKey) {
      console.error("❌ Missing Airtable environment variables for waitlist")
      return NextResponse.json(
        {
          success: false,
          error: "Missing Airtable configuration",
        },
        { status: 500 },
      )
    }

    console.log("🚀 Adding to waitlist:", { name, email })

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${emailsTableId}`

    const requestBody = {
      fields: {
        Name: name,
        Email: email,
        Subscribed: true,
        Action: "Waitlist Signup",
      },
    }

    console.log("📝 Waitlist request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("📡 Airtable waitlist response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Airtable waitlist API error:", errorText)

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

    const waitlistRecord = await response.json()
    console.log("✅ Waitlist signup successful:", waitlistRecord.id)

    return NextResponse.json({
      success: true,
      message: `Successfully added ${name} to the waitlist!`,
      recordId: waitlistRecord.id,
    })
  } catch (error) {
    console.error("💥 Unexpected error adding to waitlist:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add to waitlist",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
