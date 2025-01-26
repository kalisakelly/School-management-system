import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const prisma = new PrismaClient();

/**
 * Fetches attendance report data based on the provided date range.
 */
export async function generateAttendanceReport(
  startDate: Date,
  endDate: Date
) {
  const data = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      student: true,
      lesson: {
        include: {
          class: true,
          teacher: true,
        },
      },
    },
  });

  // Transform data for the report
  const reportData = data.map((record) => ({
    Date: record.date.toISOString().split("T")[0],
    StudentName: `${record.student.name} ${record.student.surname}`,
    Lesson: record.lesson.name,
    Class: record.lesson.class.name,
    Teacher: `${record.lesson.teacher.name} ${record.lesson.teacher.surname}`,
    Present: record.present ? "Yes" : "No",
  }));

  return exportToExcel(reportData, "AttendanceReport");
}

/**
 * Fetches announcement report data.
 */
export async function generateAnnouncementReport(
  startDate: Date,
  endDate: Date
) {
  const data = await prisma.announcement.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      class: true,
    },
  });

  // Transform data for the report
  const reportData = data.map((record) => ({
    Date: record.date.toISOString().split("T")[0],
    Title: record.title,
    Description: record.description,
    Class: record.class?.name || "General",
  }));

  return exportToExcel(reportData, "AnnouncementReport");
}

/**
 * Fetches financial report data.
 */
// export async function generateFinanceReport(startDate: Date, endDate: Date) {
//   const data = await prisma.payment.findMany({
//     where: {
//       date: {
//         gte: startDate,
//         lte: endDate,
//       },
//     },
//     include: {
//       student: true,
//     },
//   });

//   // Transform data for the report
//   const reportData = data.map((record) => ({
//     Date: record.date.toISOString().split("T")[0],
//     StudentName: `${record.student.name} ${record.student.surname}`,
//     Amount: record.amount,
//     PaymentMethod: record.method,
//   }));

//   return exportToExcel(reportData, "FinanceReport");
// }

/**
 * Converts data into an Excel file and triggers download.
 */
function exportToExcel(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Trigger file download
  saveAs(blob, `${fileName}.xlsx`);
}
