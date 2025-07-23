import { NextResponse } from "next/server"
import { baseId, apiKey, sourcesTableId } from "@/config/airtable"

export async function GET() {
  return await testAirtableConnection()
}

export async function POST() {
  return await testAirtableConnection()
}

async function testAirtableConnection() {
  try {
    console.log("🧪 Testing Airtable connection...")

    // Fixed: Remove computed fields
    const testData = {
      fields: {
        Friend_Name: "Test User",
        Platform: "Instagram",
        Username: "testuser123",
        Status: "Active",
        Active: true,
        Instagram_Handle: "testuser123",
        RSS_URL: "https://rsshub.app/instagram/user/testuser123",
        Events_Found: 0,
        // Removed Date_Added (computed field)
        // Removed Last_Checked (will be null anyway)
      },
    }

    console.log("📝 Test data:", JSON.stringify(testData, null, 2))

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${sourcesTableId}`

    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    const responseText = await response.text()
    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      let errorDetails
      try {
        const errorJson = JSON.parse(responseText)
        errorDetails = errorJson
      } catch (e) {
        errorDetails = responseText
      }

      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorDetails,
        testData: testData,
      })
    }

    const result = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      result: result,
      testData: testData,
      message: "✅ Test successful! Source creation is working.",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
