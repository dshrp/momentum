import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public")

    // Check if favicon files exist
    const faviconFiles = [
      "favicon.ico",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "apple-touch-icon.png",
      "site.webmanifest",
    ]

    const fileStatus = {}

    for (const file of faviconFiles) {
      try {
        const filePath = path.join(publicDir, file)
        const stats = await fs.stat(filePath)
        fileStatus[file] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        }
      } catch (error) {
        fileStatus[file] = {
          exists: false,
          error: error.message,
        }
      }
    }

    return NextResponse.json({
      status: "Favicon Debug Report",
      publicDirectory: publicDir,
      files: fileStatus,
      recommendations: {
        clearCache: "Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)",
        checkNetwork: "Check Network tab in DevTools for 404s on favicon files",
        testDirect: "Try accessing https://momentum.thedscs.com/favicon.ico directly",
        cacheBusting: "Added ?v=2 parameters to force cache refresh",
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
