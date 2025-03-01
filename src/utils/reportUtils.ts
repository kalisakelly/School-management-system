import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const prisma = new PrismaClient();

/**
 * Fetches attendance report data based on the provided date range.
 */
export async function generateAttendanceReport(
  startDate: Date,
  endDate: Date,
  lessonId?: number, // Optional lessonId filter (number)
  studentId?: string, // Optional studentId filter (string)
  present?: boolean // Optional filter for presence (true = Present, false = Absent)
) {
  // Define the base query
  const data = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate, // Greater than or equal to start date
        lte: endDate,   // Less than or equal to end date
      },
    },
    include: {
      student: true, // Include related student data
      lesson: {
        include: {
          class: true, // Include related class data
          teacher: true, // Include related teacher data
        },
      },
    },
  });

  // Transform data for the report
  const reportData = data.map((record) => ({
    Date: record.date.toISOString().split("T")[0], // Extract date part
    StudentName: `${record.student.name} ${record.student.surname}`, // Student full name
    Lesson: record.lesson.name, // Lesson name
    Class: record.lesson.class?.name || "N/A", // Class name (handle null case)
    Teacher: `${record.lesson.teacher?.name || "N/A"} ${record.lesson.teacher?.surname || "N/A"}`, // Teacher full name (handle null case)
    Present: record.present ? "Yes" : "No", // Present status
  }));

  // Export the transformed data to Excel
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
