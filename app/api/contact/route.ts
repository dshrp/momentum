import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields: name, email, message" }, { status: 400 })
    }

    const baseId = process.env.AIRTABLE_BASE_ID
    const apiKey = process.env.AIRTABLE_API_KEY
    const emailsTableId = process.env.AIRTABLE_EMAILS_TABLE_ID || "tbl7WInMJQYpIj9VI"

    if (!baseId || !apiKey) {
      console.error("❌ Missing Airtable environment variables for contact form")
      return NextResponse.json(
        {
          success: false,
          error: "Missing Airtable configuration",
        },
        { status: 500 },
      )
    }

    console.log("📧 Contact form submission:", { name, email, messageLength: message.length })

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${emailsTableId}`

    const requestBody = {
      fields: {
        Name: name,
        Email: email,
        Subscribed: false, // Don't subscribe them to emails
        Action: message, // Put their message in the Action field
      },
    }

    console.log("📝 Contact request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("📡 Airtable contact response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Airtable contact API error:", errorText)

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

    const contactRecord = await response.json()
    console.log("✅ Contact message saved successfully:", contactRecord.id)

    return NextResponse.json({
      success: true,
      message: `Message received! We'll get back to you soon.`,
      recordId: contactRecord.id,
    })
  } catch (error) {
    console.error("💥 Unexpected error saving contact message:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
