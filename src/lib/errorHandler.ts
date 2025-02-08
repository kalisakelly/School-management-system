import { NextResponse } from "next/server"

export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
}

