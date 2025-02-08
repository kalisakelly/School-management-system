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

    case "performance":
      data = await prisma.result.findMany({
        where: {
          AND: [
            { studentId: studentId },
            {
              OR: [
                { exam: { startTime: { gte: new Date(startDate), lte: new Date(endDate) } } },
                { assignment: { dueDate: { gte: new Date(startDate), lte: new Date(endDate) } } },
              ],
            },
          ],
        },
        include: {
          exam: true,
          assignment: true,
        },
      })
      reportData = data.map((record) => ({
        Type: record.examId ? "Exam" : "Assignment",
        Title: record.exam?.title || record.assignment?.title || "N/A",
        Score: record.score,
        Date:
          record.exam?.startTime?.toISOString().split("T")[0] ||
          record.assignment?.dueDate?.toISOString().split("T")[0] ||
          "N/A",
      }))
      break

    case "events":
      data = await prisma.event.findMany({
        where: {
          AND: [
            { classId: classId },
            {
              startTime: { gte: new Date(startDate) },
              endTime: { lte: new Date(endDate) },
            },
          ],
        },
        include: { class: true },
      })
      reportData = data.map((record) => ({
        Title: record.title,
        Description: record.description,
        Start: record.startTime.toISOString().split("T")[0],
        End: record.endTime.toISOString().split("T")[0],
        Class: record.class?.name || "General",
      }))
      break

    case "assignments":
      data = await prisma.assignment.findMany({
        where: {
          AND: [
            { lesson: { teacherId: teacherId } },
            {
              startDate: { gte: new Date(startDate) },
              dueDate: { lte: new Date(endDate) },
            },
          ],
        },
        include: { lesson: { include: { teacher: true } } },
      })
      reportData = data.map((record) => ({
        Title: record.title,
        Start: record.startDate.toISOString().split("T")[0],
        Due: record.dueDate.toISOString().split("T")[0],
        Teacher: `${record.lesson.teacher.name} ${record.lesson.teacher.surname}`,
      }))
      break

    case "class-composition":
      data = await prisma.student.findMany({
        where: { classId: classId },
        include: { class: true },
      })
      reportData = data.map((student) => ({
        Name: `${student.name} ${student.surname}`,
        Email: student.email || "N/A",
        Phone: student.phone || "N/A",
        Address: student.address,
        BloodType: student.bloodType,
        Sex: student.sex,
        Class: student.class.name,
      }))
      break

    default:
      throw new Error("Invalid report type")
  }

  const worksheet = XLSX.utils.json_to_sheet(reportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1))

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })
}

