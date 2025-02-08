import { type NextRequest, NextResponse } from "next/server"
import { generateReport } from "@/lib/reportGenerator"
import { handleApiError } from "@/lib/errorHandler"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { startDate, endDate, type, classId, studentId, teacherId } = body

    const excelBuffer = await generateReport(type, {
      startDate,
      endDate,
      classId,
      studentId,
      teacherId,
    })

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${type}Report.xlsx`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

