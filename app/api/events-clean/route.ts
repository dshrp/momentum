import { NextResponse } from "next/server"

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID // Raw events table
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

interface AirtableRecord {
  id: string
  fields: Record<string, any>
  createdTime: string
}

interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

interface CleanEvent {
  id: string
  title: string
  description: string
  date: string | null
  time: string
  venue: string
  location: string
  friend: string
  source: string
  type: string
  sourceUrl: string
  isUpcoming: boolean
  hidden: boolean
  userUpdated: boolean
  lastUserUpdate: string | null
  userUpdateFields: string | null
  missingData: Record<string, boolean> | null
  createdTime: string
  duplicateIds: string[] // Track which raw records this represents
}

export async function GET(request: Request) {
  try {
    console.log("🧹 Starting CLEAN events API call...")

    // Add aggressive cache busting
    const url = new URL(request.url)
    const cacheBuster = url.searchParams.get("_") || Date.now().toString()
    console.log(`🚫 Cache buster: ${cacheBuster}`)

    console.log("Environment check:", {
      hasBaseId: !!AIRTABLE_BASE_ID,
      hasTableId: !!AIRTABLE_TABLE_ID,
      hasApiKey: !!AIRTABLE_API_KEY,
    })

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID || !AIRTABLE_API_KEY) {
      console.error("❌ Missing Airtable configuration")
      return NextResponse.json(
        {
          error: "Configuration Error",
          details: "Missing Airtable configuration - check environment variables",
          events: [],
          stats: { total: 0, upcoming: 0, past: 0, duplicatesRemoved: 0, userUpdated: 0 },
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            "Surrogate-Control": "no-store",
          },
        },
      )
    }

    // Fetch all records with pagination and aggressive cache busting
    let allRecords: AirtableRecord[] = []
    let offset: string | undefined

    do {
      const airtableUrl = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`)
      if (offset) {
        airtableUrl.searchParams.set("offset", offset)
      }
      airtableUrl.searchParams.set("pageSize", "100")
      // Add cache buster to Airtable request
      airtableUrl.searchParams.set("cacheBuster", cacheBuster)

      console.log(`📡 Fetching from Airtable with cache buster: ${airtableUrl.toString()}`)

      const response = await fetch(airtableUrl.toString(), {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
          // Add cache busting headers
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        // Ensure no caching at fetch level
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Airtable API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: AirtableResponse = await response.json()
      allRecords = allRecords.concat(data.records)
      offset = data.offset

      console.log(`📊 Fetched ${data.records.length} records, total so far: ${allRecords.length}`)
    } while (offset)

    console.log(`✅ Total raw records fetched: ${allRecords.length}`)

    // Log all Dylan events for debugging
    const dylanEvents = allRecords.filter((record) => {
      const title = getFieldValue(record, ["Title", "Event_Title", "Name", "Event_Name", "Event"])
      return title && title.toLowerCase().includes("dark ride")
    })
    console.log(
      `🔍 Found ${dylanEvents.length} Dylan 'Dark Ride' events in raw data:`,
      dylanEvents.map((r) => ({
        id: r.id,
        title: getFieldValue(r, ["Title", "Event_Title", "Name", "Event_Name", "Event"]),
      })),
    )

    if (allRecords.length === 0) {
      return NextResponse.json(
        {
          events: [],
          stats: { total: 0, upcoming: 0, past: 0, duplicatesRemoved: 0, userUpdated: 0 },
          timestamp: new Date().toISOString(),
          warning: "No records found in Airtable table",
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            "Surrogate-Control": "no-store",
          },
        },
      )
    }

    // Transform and filter records
    const processedRecords = allRecords
      .map((record) => {
        try {
          const title = getFieldValue(record, ["Title", "Event_Title", "Name", "Event_Name", "Event"])
          const description = getFieldValue(record, [
            "Description",
            "Event_Description",
            "Details",
            "Event_Details",
            "Caption",
            "Post_Caption",
            "Text",
            "Content",
          ])
          const date = getFieldValue(record, ["Date", "Event_Date", "Start_Date", "Scheduled_Date"])
          const time = getFieldValue(record, ["Time", "Event_Time", "Start_Time", "Scheduled_Time"])
          const venue = getFieldValue(record, ["Venue", "Event_Venue", "Location_Name", "Place", "Venue_Name"])
          const location = getFieldValue(record, [
            "Location",
            "Event_Location",
            "City",
            "Event_City",
            "Place_Location",
            "Address",
          ])
          const friend = getFieldValue(record, [
            "Friend",
            "Friend_Name",
            "User",
            "Username",
            "Account",
            "Account_Name",
            "Instagram_User",
            "Instagram_Username",
            "Creator",
            "Posted_By",
          ])
          const source = getFieldValue(record, ["Source", "Platform", "Social_Platform", "Origin"])
          const type = getFieldValue(record, ["Type", "Event_Type", "Category", "Event_Category", "Classification"])
          const sourceUrl = getFieldValue(record, [
            "Source_URL",
            "URL",
            "Link",
            "Post_URL",
            "Instagram_URL",
            "Original_URL",
          ])

          // Check for hidden status
          const notShown = getFieldValue(record, [
            "Not_Shown",
            "Not Shown",
            "Hidden",
            "Hide",
            "Excluded",
            "not_shown",
            "hidden",
          ])

          const hidden =
            notShown === true ||
            notShown === "true" ||
            notShown === "TRUE" ||
            notShown === 1 ||
            notShown === "1" ||
            notShown === "yes" ||
            notShown === "YES"

          // User update tracking
          const userUpdated = getFieldValue(record, [
            "User_Updated",
            "User Updated",
            "Updated_By_User",
            "Manual_Update",
            "user_updated",
          ])
          const lastUserUpdate = getFieldValue(record, [
            "Last_User_Update",
            "Last User Update",
            "User_Update_Date",
            "Manual_Update_Date",
          ])
          const userUpdateFields = getFieldValue(record, [
            "User_Update_Fields",
            "User Update Fields",
            "Updated_Fields",
            "Modified_Fields",
          ])

          const processedRecord = {
            id: record.id,
            title: title || "Untitled Event",
            description: description || "",
            date: date || null,
            time: time || "Time TBD",
            venue: venue || "TBD",
            location: location || "TBD",
            friend: friend || "Unknown",
            source: source || "Instagram",
            type: type || "Event",
            sourceUrl: sourceUrl || "#",
            hidden,
            userUpdated: userUpdated === true || userUpdated === "true" || userUpdated === 1,
            lastUserUpdate: lastUserUpdate || null,
            userUpdateFields: userUpdateFields || null,
            createdTime: record.createdTime,
          }

          // Log Dylan events specifically
          if (processedRecord.title.toLowerCase().includes("dark ride")) {
            console.log(`🎯 Processed Dylan event:`, {
              id: processedRecord.id,
              title: processedRecord.title,
              hidden: processedRecord.hidden,
              userUpdated: processedRecord.userUpdated,
            })
          }

          return processedRecord
        } catch (err) {
          console.error("❌ Error processing record:", record.id, err)
          return null
        }
      })
      .filter((record): record is NonNullable<typeof record> => record !== null)

    console.log(`📊 Processed ${processedRecords.length} records`)

    // STEP 1: Filter out explicitly hidden events
    const visibleRecords = processedRecords.filter((record) => {
      if (record.hidden) {
        console.log(`🙈 Filtering out hidden event: "${record.title}" by ${record.friend}`)
        return false
      }
      return true
    })
    console.log(`👁️ Visible events after filtering: ${visibleRecords.length}`)

    // Log visible Dylan events
    const visibleDylanEvents = visibleRecords.filter((r) => r.title.toLowerCase().includes("dark ride"))
    console.log(
      `🎯 Visible Dylan events after hidden filter:`,
      visibleDylanEvents.map((r) => ({ id: r.id, title: r.title, userUpdated: r.userUpdated })),
    )

    // STEP 2: AGGRESSIVE DEDUPLICATION with priority system
    const eventGroups = new Map<string, typeof visibleRecords>()

    visibleRecords.forEach((record) => {
      // Create multiple deduplication keys to catch variations
      const titleNormalized = (record.title || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .replace(/\b(by|with|at|the|a|an|exhibition)\b/g, "") // Remove common words
        .trim()

      const friendNormalized = (record.friend || "").toLowerCase().trim()
      const dateKey = record.date || "no-date"

      // Primary key: title + friend + date
      const primaryKey = `${titleNormalized}-${friendNormalized}-${dateKey}`

      // Secondary key: just title + date (catches same event by different friends)
      const secondaryKey = `${titleNormalized}-${dateKey}`

      // Tertiary key: title + friend (catches same event with different/missing dates)
      const tertiaryKey = `${titleNormalized}-${friendNormalized}`

      // Check all keys to see if this is a duplicate
      let groupKey = primaryKey
      if (eventGroups.has(primaryKey)) {
        groupKey = primaryKey
      } else if (eventGroups.has(secondaryKey)) {
        groupKey = secondaryKey
      } else if (eventGroups.has(tertiaryKey)) {
        groupKey = tertiaryKey
      }

      if (!eventGroups.has(groupKey)) {
        eventGroups.set(groupKey, [])
      }
      eventGroups.get(groupKey)!.push(record)

      // Log Dylan grouping specifically
      if (record.title.toLowerCase().includes("dark ride")) {
        console.log(`🔑 Grouped Dylan event "${record.title}" (${record.id}) under key: ${groupKey}`)
      }
    })

    console.log(`🔍 Found ${eventGroups.size} unique event groups from ${visibleRecords.length} visible events`)

    // STEP 3: Select best record from each group with smart merging
    const cleanEvents: CleanEvent[] = []
    let duplicatesRemoved = 0

    eventGroups.forEach((records, groupKey) => {
      if (records.length === 1) {
        // No duplicates, process normally
        const record = records[0]
        cleanEvents.push({
          ...record,
          isUpcoming: calculateIsUpcoming(record.date),
          missingData: calculateMissingData(record),
          duplicateIds: [record.id],
        })
        return
      }

      console.log(`🔄 Processing ${records.length} duplicates for group: ${groupKey}`)
      duplicatesRemoved += records.length - 1

      // Sort records by priority
      const sortedRecords = records.sort((a, b) => {
        // 1. User-updated records have highest priority
        if (a.userUpdated && !b.userUpdated) return -1
        if (!a.userUpdated && b.userUpdated) return 1

        // 2. If both user-updated, prefer most recent update
        if (a.userUpdated && b.userUpdated) {
          const dateA = a.lastUserUpdate ? new Date(a.lastUserUpdate) : new Date(0)
          const dateB = b.lastUserUpdate ? new Date(b.lastUserUpdate) : new Date(0)
          if (dateA > dateB) return -1
          if (dateA < dateB) return 1
        }

        // 3. Prefer records with more complete data
        const scoreA = calculateCompletenessScore(a)
        const scoreB = calculateCompletenessScore(b)
        if (scoreA !== scoreB) return scoreB - scoreA

        // 4. Fall back to most recent creation time
        const createdA = new Date(a.createdTime)
        const createdB = new Date(b.createdTime)
        return createdB.getTime() - createdA.getTime()
      })

      const bestRecord = sortedRecords[0]
      const otherRecords = sortedRecords.slice(1)

      console.log(`✅ Selected best record for ${groupKey}:`, {
        selectedId: bestRecord.id,
        selectedTitle: bestRecord.title,
        userUpdated: bestRecord.userUpdated,
        completenessScore: calculateCompletenessScore(bestRecord),
        rejectedIds: otherRecords.map((r) => `${r.id}(${r.title})`),
      })

      // Create merged event with smart data combination
      const mergedEvent: CleanEvent = {
        ...bestRecord,
        isUpcoming: calculateIsUpcoming(bestRecord.date),
        missingData: calculateMissingData(bestRecord),
        duplicateIds: records.map((r) => r.id),
      }

      // Merge missing data from other records (only if best record is missing it)
      otherRecords.forEach((otherRecord) => {
        if (
          (!mergedEvent.title || mergedEvent.title === "Untitled Event") &&
          otherRecord.title &&
          otherRecord.title !== "Untitled Event"
        ) {
          mergedEvent.title = otherRecord.title
        }
        if (!mergedEvent.description && otherRecord.description) {
          mergedEvent.description = otherRecord.description
        }
        if (!mergedEvent.date && otherRecord.date) {
          mergedEvent.date = otherRecord.date
          mergedEvent.isUpcoming = calculateIsUpcoming(otherRecord.date)
        }
        if (
          (!mergedEvent.time || mergedEvent.time === "Time TBD") &&
          otherRecord.time &&
          otherRecord.time !== "Time TBD"
        ) {
          mergedEvent.time = otherRecord.time
        }
        if ((!mergedEvent.venue || mergedEvent.venue === "TBD") && otherRecord.venue && otherRecord.venue !== "TBD") {
          mergedEvent.venue = otherRecord.venue
        }
        if (
          (!mergedEvent.location || mergedEvent.location === "TBD") &&
          otherRecord.location &&
          otherRecord.location !== "TBD"
        ) {
          mergedEvent.location = otherRecord.location
        }
        if (
          (!mergedEvent.sourceUrl || mergedEvent.sourceUrl === "#") &&
          otherRecord.sourceUrl &&
          otherRecord.sourceUrl !== "#"
        ) {
          mergedEvent.sourceUrl = otherRecord.sourceUrl
        }
      })

      // Recalculate missing data after merging
      mergedEvent.missingData = calculateMissingData(mergedEvent)

      cleanEvents.push(mergedEvent)
    })

    console.log(`🎯 Final clean events: ${cleanEvents.length}`)
    console.log(`🗑️ Duplicates removed: ${duplicatesRemoved}`)

    // Log final Dylan events
    const finalDylanEvents = cleanEvents.filter((e) => e.title.toLowerCase().includes("dark ride"))
    console.log(
      `🎯 Final Dylan events in clean data:`,
      finalDylanEvents.map((e) => ({ id: e.id, title: e.title, userUpdated: e.userUpdated })),
    )

    // Calculate statistics
    const upcomingEvents = cleanEvents.filter((event) => event.isUpcoming)
    const pastEvents = cleanEvents.filter((event) => !event.isUpcoming)
    const userUpdatedEvents = cleanEvents.filter((event) => event.userUpdated)

    const stats = {
      total: cleanEvents.length,
      upcoming: upcomingEvents.length,
      past: pastEvents.length,
      duplicatesRemoved,
      userUpdated: userUpdatedEvents.length,
    }

    console.log("📊 Final clean stats:", stats)

    return NextResponse.json(
      {
        events: cleanEvents,
        stats,
        timestamp: new Date().toISOString(),
        cacheBuster: cacheBuster,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      },
    )
  } catch (error) {
    console.error("❌ Clean Events API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch clean events",
        details: error instanceof Error ? error.message : "Unknown error",
        events: [],
        stats: { total: 0, upcoming: 0, past: 0, duplicatesRemoved: 0, userUpdated: 0 },
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      },
    )
  }
}

// Helper function to get field value with multiple possible field names
function getFieldValue(record: AirtableRecord, possibleNames: string[]): any {
  for (const name of possibleNames) {
    if (record.fields[name] !== undefined && record.fields[name] !== null && record.fields[name] !== "") {
      return record.fields[name]
    }
  }
  return null
}

// Helper functions
function calculateIsUpcoming(dateStr: string | null): boolean {
  if (!dateStr) return false

  try {
    let eventDate: Date
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      eventDate = new Date(dateStr + "T23:59:59.999Z")
    } else {
      eventDate = new Date(dateStr)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDateLocal = new Date(eventDate.getTime())
    eventDateLocal.setHours(0, 0, 0, 0)

    return eventDateLocal >= today
  } catch (err) {
    return false
  }
}

function calculateMissingData(record: any): Record<string, boolean> | null {
  const missingData: Record<string, boolean> = {}
  if (!record.title || record.title === "Untitled Event") missingData.title = true
  if (!record.time || record.time === "Time TBD") missingData.time = true
  if (!record.venue || record.venue === "TBD") missingData.venue = true
  if (!record.date) missingData.date = true
  return Object.keys(missingData).length > 0 ? missingData : null
}

function calculateCompletenessScore(record: any): number {
  let score = 0
  if (record.title && record.title !== "Untitled Event") score++
  if (record.description) score++
  if (record.date) score++
  if (record.time && record.time !== "Time TBD") score++
  if (record.venue && record.venue !== "TBD") score++
  if (record.location && record.location !== "TBD") score++
  if (record.sourceUrl && record.sourceUrl !== "#") score++
  return score
}
