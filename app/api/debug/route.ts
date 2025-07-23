import { NextResponse } from "next/server"

export async function GET() {
  // This endpoint will help us debug environment variable issues
  return NextResponse.json({
    hasBaseId: !!process.env.AIRTABLE_BASE_ID,
    hasTableId: !!process.env.AIRTABLE_TABLE_ID,
    hasApiKey: !!process.env.AIRTABLE_API_KEY,
    baseIdLength: process.env.AIRTABLE_BASE_ID?.length || 0,
    tableIdLength: process.env.AIRTABLE_TABLE_ID?.length || 0,
    apiKeyLength: process.env.AIRTABLE_API_KEY?.length || 0,
    baseIdPrefix: process.env.AIRTABLE_BASE_ID?.substring(0, 3) || "none",
    tableIdPrefix: process.env.AIRTABLE_TABLE_ID?.substring(0, 3) || "none",
    apiKeyPrefix: process.env.AIRTABLE_API_KEY?.substring(0, 3) || "none",
    timestamp: new Date().toISOString(),
  })
}
