// Vercel Cron Job endpoint
// Add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/sync-constants",
//     "schedule": "0 */6 * * *" // Every 6 hours
//   }]
// }

import { NextResponse } from "next/server"
import { refreshJobConstantsCache } from "@/lib/cache/job-constants-cache"

export async function GET(request: Request) {
  try {
    // Verify this is a cron request (in production)
    const authHeader = request.headers.get("authorization")
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔄 Starting scheduled constants sync...")

    await refreshJobConstantsCache()

    console.log("✅ Constants cache refreshed successfully")

    return NextResponse.json({
      success: true,
      message: "Constants synced successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Failed to sync constants:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync constants",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
