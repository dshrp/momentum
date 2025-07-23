import { NextResponse } from "next/server"

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID
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

export async function GET() {
  try {
    console.log("🔄 Starting events API call...")
    console.log("Environment check:", {
      hasBaseId: !!AIRTABLE_BASE_ID,
      hasTableId: !!AIRTABLE_TABLE_ID,
      hasApiKey: !!AIRTABLE_API_KEY,
      baseId: AIRTABLE_BASE_ID ? `${AIRTABLE_BASE_ID.substring(0, 8)}...` : "missing",
      tableId: AIRTABLE_TABLE_ID ? `${AIRTABLE_TABLE_ID.substring(0, 8)}...` : "missing",
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
        { status: 500 },
      )
    }

    // Fetch all records with pagination
    let allRecords: AirtableRecord[] = []
    let offset: string | undefined

    do {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`)
      if (offset) {
        url.searchParams.set("offset", offset)
      }
      url.searchParams.set("pageSize", "100") // Maximum page size

      console.log(`📡 Fetching from Airtable: ${url.toString()}`)

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      })

      console.log(`📡 Airtable response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Airtable API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url.toString(),
        })
        throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: AirtableResponse = await response.json()
      allRecords = allRecords.concat(data.records)
      offset = data.offset

      console.log(`📊 Fetched ${data.records.length} records, total so far: ${allRecords.length}`)
    } while (offset)

    console.log(`✅ Total records fetched: ${allRecords.length}`)

    if (allRecords.length === 0) {
      console.warn("⚠️ No records found in Airtable")
      return NextResponse.json({
        events: [],
        stats: { total: 0, upcoming: 0, past: 0, duplicatesRemoved: 0, userUpdated: 0 },
        timestamp: new Date().toISOString(),
        warning: "No records found in Airtable table",
      })
    }

    // Helper function to get field value with multiple possible field names
    const getFieldValue = (record: AirtableRecord, possibleNames: string[]): any => {
      for (const name of possibleNames) {
        if (record.fields[name] !== undefined && record.fields[name] !== null && record.fields[name] !== "") {
          return record.fields[name]
        }
      }
      return null
    }

    // Transform records to events with enhanced field mapping
    const events = allRecords
      .map((record) => {
        try {
          // Enhanced field mapping with more possible field names
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

          // ENHANCED: Check for hidden/not shown status with more field variations
          const notShown = getFieldValue(record, [
            "Not_Shown",
            "Not Shown",
            "Hidden",
            "Hide",
            "Excluded",
            "not_shown",
            "hidden",
          ])

          // More robust hidden check - handle various truthy values
          const hidden =
            notShown === true ||
            notShown === "true" ||
            notShown === "TRUE" ||
            notShown === 1 ||
            notShown === "1" ||
            notShown === "yes" ||
            notShown === "YES"

          // User update tracking with more field variations
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

          // FIXED: More robust date parsing and upcoming logic
          let isUpcoming = false
          if (date) {
            try {
              // Handle various date formats and ensure proper parsing
              let eventDate: Date

              if (typeof date === "string") {
                // Handle YYYY-MM-DD format specifically
                if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  eventDate = new Date(date + "T23:59:59.999Z") // End of day in UTC
                } else {
                  eventDate = new Date(date)
                }
              } else {
                eventDate = new Date(date)
              }

              // Get current date at start of day for comparison
              const today = new Date()
              today.setHours(0, 0, 0, 0)

              // Convert event date to local timezone for comparison
              const eventDateLocal = new Date(eventDate.getTime())
              eventDateLocal.setHours(0, 0, 0, 0)

              isUpcoming = eventDateLocal >= today

              console.log(`📅 Date check for "${title}":`, {
                originalDate: date,
                eventDateLocal: eventDateLocal.toISOString(),
                today: today.toISOString(),
                isUpcoming,
              })
            } catch (err) {
              console.warn(`⚠️ Invalid date format for "${title}": ${date}`, err)
              isUpcoming = false
            }
          }

          // Track missing data for UI warnings
          const missingData: Record<string, boolean> = {}
          if (!title) missingData.title = true
          if (!time || time === "Time TBD") missingData.time = true
          if (!venue) missingData.venue = true
          if (!date) missingData.date = true

          const event = {
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
            isUpcoming,
            hidden,
            userUpdated: userUpdated === true || userUpdated === "true" || userUpdated === 1,
            lastUserUpdate: lastUserUpdate || null,
            userUpdateFields: userUpdateFields || null,
            missingData: Object.keys(missingData).length > 0 ? missingData : null,
            createdTime: record.createdTime,
          }

          console.log(
            `📝 Processed event: "${event.title}" by ${event.friend} - Date: ${event.date} - Upcoming: ${event.isUpcoming} - Hidden: ${event.hidden}`,
          )
          return event
        } catch (err) {
          console.error("❌ Error processing record:", record.id, err)
          return null
        }
      })
      .filter((event): event is NonNullable<typeof event> => event !== null)

    console.log(`📊 Processed ${events.length} events total`)

    // ENHANCED: Filter out hidden events with better logging
    const visibleEvents = events.filter((event) => {
      const isVisible = !event.hidden
      if (!isVisible) {
        console.log(`🙈 Filtering out hidden event: "${event.title}" by ${event.friend}`)
      }
      return isVisible
    })
    console.log(`👁️ Visible events after filtering: ${visibleEvents.length}`)

    // ENHANCED: Improved deduplication logic with better unique key generation
    const eventGroups = new Map<string, typeof visibleEvents>()

    // Group events by unique identifier - improved key generation
    visibleEvents.forEach((event) => {
      // Create a more robust unique key
      const titleKey = (event.title || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, "")
      const friendKey = (event.friend || "").toLowerCase().trim()
      const dateKey = event.date || "no-date"

      // More specific unique key that accounts for slight title variations
      const uniqueKey = `${titleKey}-${friendKey}-${dateKey}`

      if (!eventGroups.has(uniqueKey)) {
        eventGroups.set(uniqueKey, [])
      }
      eventGroups.get(uniqueKey)!.push(event)

      console.log(`🔑 Grouped event "${event.title}" under key: ${uniqueKey}`)
    })

    console.log(`🔍 Found ${eventGroups.size} unique event groups from ${visibleEvents.length} visible events`)

    // Process each group to select the best record and merge data
    const deduplicatedEvents: typeof visibleEvents = []
    let duplicatesRemoved = 0

    eventGroups.forEach((events, uniqueKey) => {
      if (events.length === 1) {
        // No duplicates, keep as is
        deduplicatedEvents.push(events[0])
        return
      }

      console.log(`🔄 Processing ${events.length} duplicates for: ${uniqueKey}`)
      console.log(`   Event IDs: ${events.map((e) => `${e.id}(${e.title})`).join(", ")}`)
      duplicatesRemoved += events.length - 1

      // ENHANCED: Better sorting logic for selecting the best record
      const sortedEvents = events.sort((a, b) => {
        // 1. Prioritize user-updated records
        if (a.userUpdated && !b.userUpdated) return -1
        if (!a.userUpdated && b.userUpdated) return 1

        // 2. If both are user-updated, compare update dates
        if (a.userUpdated && b.userUpdated) {
          const dateA = a.lastUserUpdate ? new Date(a.lastUserUpdate) : new Date(0)
          const dateB = b.lastUserUpdate ? new Date(b.lastUserUpdate) : new Date(0)
          if (dateA > dateB) return -1
          if (dateA < dateB) return 1
        }

        // 3. Fall back to creation time (most recent first)
        const createdA = new Date(a.createdTime)
        const createdB = new Date(b.createdTime)
        return createdB.getTime() - createdA.getTime()
      })

      // Select the best record (first after sorting)
      const bestRecord = sortedEvents[0]
      const otherRecords = sortedEvents.slice(1)

      console.log(`✅ Selected best record for ${uniqueKey}:`, {
        selectedId: bestRecord.id,
        selectedTitle: bestRecord.title,
        userUpdated: bestRecord.userUpdated,
        lastUserUpdate: bestRecord.lastUserUpdate,
        rejectedIds: otherRecords.map((r) => `${r.id}(${r.title})`),
      })

      // Create merged event starting with the best record
      const mergedEvent = { ...bestRecord }

      // ENHANCED: Better data merging logic
      otherRecords.forEach((otherEvent) => {
        // Only merge data if the best record is missing it and the other record has it
        if (
          (!mergedEvent.title || mergedEvent.title === "Untitled Event") &&
          otherEvent.title &&
          otherEvent.title !== "Untitled Event"
        ) {
          mergedEvent.title = otherEvent.title
        }
        if (!mergedEvent.description && otherEvent.description) {
          mergedEvent.description = otherEvent.description
        }
        if (!mergedEvent.date && otherEvent.date) {
          mergedEvent.date = otherEvent.date
          // Recalculate isUpcoming if we got a new date
          try {
            const eventDate = new Date(otherEvent.date + "T23:59:59.999Z")
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const eventDateLocal = new Date(eventDate.getTime())
            eventDateLocal.setHours(0, 0, 0, 0)
            mergedEvent.isUpcoming = eventDateLocal >= today
          } catch (err) {
            console.warn(`⚠️ Error recalculating isUpcoming for merged event: ${err}`)
          }
        }
        if (
          (!mergedEvent.time || mergedEvent.time === "Time TBD") &&
          otherEvent.time &&
          otherEvent.time !== "Time TBD"
        ) {
          mergedEvent.time = otherEvent.time
        }
        if ((!mergedEvent.venue || mergedEvent.venue === "TBD") && otherEvent.venue && otherEvent.venue !== "TBD") {
          mergedEvent.venue = otherEvent.venue
        }
        if (
          (!mergedEvent.location || mergedEvent.location === "TBD") &&
          otherEvent.location &&
          otherEvent.location !== "TBD"
        ) {
          mergedEvent.location = otherEvent.location
        }
        if (
          (!mergedEvent.sourceUrl || mergedEvent.sourceUrl === "#") &&
          otherEvent.sourceUrl &&
          otherEvent.sourceUrl !== "#"
        ) {
          mergedEvent.sourceUrl = otherEvent.sourceUrl
        }
      })

      deduplicatedEvents.push(mergedEvent)
    })

    console.log(`🎯 Final deduplicated events: ${deduplicatedEvents.length}`)
    console.log(`🗑️ Duplicates removed: ${duplicatesRemoved}`)

    // ENHANCED: Better statistics calculation with logging
    const upcomingEvents = deduplicatedEvents.filter((event) => event.isUpcoming)
    const pastEvents = deduplicatedEvents.filter((event) => !event.isUpcoming)
    const userUpdatedEvents = deduplicatedEvents.filter((event) => event.userUpdated)

    console.log("📊 Event breakdown:")
    console.log(`   Upcoming events: ${upcomingEvents.map((e) => `"${e.title}" (${e.date})`).join(", ")}`)
    console.log(`   Past events: ${pastEvents.length}`)
    console.log(`   User updated: ${userUpdatedEvents.length}`)

    const stats = {
      total: deduplicatedEvents.length,
      upcoming: upcomingEvents.length,
      past: pastEvents.length,
      duplicatesRemoved,
      userUpdated: userUpdatedEvents.length,
    }

    console.log("📊 Final stats:", stats)

    return NextResponse.json({
      events: deduplicatedEvents,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Events API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : "Unknown error",
        events: [],
        stats: { total: 0, upcoming: 0, past: 0, duplicatesRemoved: 0, userUpdated: 0 },
      },
      { status: 500 },
    )
  }
}
