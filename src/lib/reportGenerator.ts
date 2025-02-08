import { PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"

const prisma = new PrismaClient()

export async function generateReport(type: string, params: any) {
  const { startDate, endDate, classId, studentId, teacherId } = params

  let data
  let reportData

  switch (type) {
    case "announcement":
      data = await prisma.announcement.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: { class: true },
      })
      reportData = data.map((record) => ({
        Date: record.date.toISOString().split("T")[0],
        Title: record.title,
        Description: record.description,
        Class: record.class?.name || "General",
      }))
      break

    case "attendance":
      data = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          OR: [{ studentId: studentId }, { lesson: { classId: classId } }],
        },
        include: {
          student: true,
          lesson: {
            include: {
              class: true,
            },
          },
        },
      })
      reportData = data.map((record) => ({
        Date: record.date.toISOString().split("T")[0],
        Student: `${record.student.name} ${record.student.surname}`,
        Class: record.lesson.class.name,
        Present: record.present ? "Yes" : "No",
      }))
      break

    // Add cases for other report types here...

    default:
      throw new Error("Invalid report type")
  }

  const worksheet = XLSX.utils.json_to_sheet(reportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1))

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })
}

