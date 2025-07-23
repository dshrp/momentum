//
// Centralised Airtable config – import these **only inside server files** (e.g. Route Handlers)
// so that environment variables never leak to the browser.
//
export const baseId = process.env.AIRTABLE_BASE_ID ?? ""

export const apiKey = process.env.AIRTABLE_API_KEY ?? ""

/**
 * We first try the dedicated AIRTABLE_SOURCES_TABLE_ID.
 * If that is not set, we fall back to AIRTABLE_TABLE_ID
 * so local development continues to work.
 */
export const sourcesTableId = process.env.AIRTABLE_SOURCES_TABLE_ID || process.env.AIRTABLE_TABLE_ID || ""
