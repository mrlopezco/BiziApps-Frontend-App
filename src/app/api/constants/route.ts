import { NextResponse } from "next/server"
import { getAllJobConstants } from "@/lib/cache/job-constants-cache"

export async function GET() {
  try {
    const constants = await getAllJobConstants()

    return NextResponse.json({
      success: true,
      data: constants,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to fetch job constants:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch constants",
      },
      { status: 500 },
    )
  }
}

// Optional: POST endpoint to force cache refresh (for admin use)
export async function POST() {
  try {
    const { refreshJobConstantsCache } = await import("@/lib/cache/job-constants-cache")
    await refreshJobConstantsCache()

    return NextResponse.json({
      success: true,
      message: "Cache refreshed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to refresh cache:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh cache",
      },
      { status: 500 },
    )
  }
}
