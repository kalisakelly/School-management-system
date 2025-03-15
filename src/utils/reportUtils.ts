// reports.ts
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const prisma = new PrismaClient();

/**
 * Utility function to export data to Excel and trigger file download.
 */
function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName: string = "Report"
): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  // Trigger file download
  saveAs(blob, `${fileName}.xlsx`);
}

/**
 * Abstract function to fetch and transform data for reports.
 */
async function fetchDataAndExport<T extends Record<string, any>>(
  query: any,
  transformer: (data: any[]) => T[],
  fileName: string,
  sheetName: string = "Report"
): Promise<void> {
  try {
    const rawData = await prisma.$transaction([prisma[query.model].findMany(query.options)]);
    const transformedData = transformer(rawData[0]);

    if (transformedData.length === 0) {
      console.warn("No data found for the given criteria.");
      return;
    }

    exportToExcel(transformedData, fileName, sheetName);
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate the report.");
  }
}

/**
 * Generates an attendance report based on the provided date range and filters.
 */
export async function generateAttendanceReport(
  startDate: Date,
  endDate: Date,
  lessonId?: number,
  studentId?: string,
  present?: boolean
): Promise<void> {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required.");
  }

  const query = {
    model: "attendance",
    options: {
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(lessonId !== undefined && { lesson: { id: lessonId } }),
        ...(studentId !== undefined && { student: { id: studentId } }),
        ...(present !== undefined && { present }),
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
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Date: record.date.toISOString().split("T")[0],
      StudentName: `${record.student.name} ${record.student.surname}`,
      Lesson: record.lesson.name,
      Class: record.lesson.class?.name || "N/A",
      Teacher: `${record.lesson.teacher?.name || "N/A"} ${record.lesson.teacher?.surname || "N/A"}`,
      Present: record.present ? "Yes" : "No",
    }));

  await fetchDataAndExport(query, transformer, "AttendanceReport");
}

/**
 * Generates an announcement report based on the provided date range.
 */
export async function generateAnnouncementReport(
  startDate: Date,
  endDate: Date
): Promise<void> {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required.");
  }

  const query = {
    model: "announcement",
    options: {
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        class: true,
      },
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Date: record.date.toISOString().split("T")[0],
      Title: record.title,
      Description: record.description,
      Class: record.class?.name || "General",
    }));

  await fetchDataAndExport(query, transformer, "AnnouncementReport");
}

export async function generateParentReport(): Promise<void> {
  const query = {
    model: "parent",
    options: {
      include: {
        students: true,
      },
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Username: record.username,
      Name: `${record.name} ${record.surname}`,
      Email: record.email || "N/A",
      Phone: record.phone,
      Address: record.address,
      CreatedAt: record.createdAt.toISOString().split("T")[0],
      StudentCount: record.students.length,
    }));

  await fetchDataAndExport(query, transformer, "ParentReport");
}

export async function generateStudentReport(): Promise<void> {
  const query = {
    model: "student",
    options: {
      include: {
        parent: true,
        class: true,
        grade: true,
      },
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Username: record.username,
      Name: `${record.name} ${record.surname}`,
      Email: record.email || "N/A",
      Phone: record.phone || "N/A",
      Address: record.address,
      BloodType: record.bloodType,
      Sex: record.sex,
      Birthday: record.birthday.toISOString().split("T")[0],
      Parent: `${record.parent.name} ${record.parent.surname}`,
      Class: record.class.name,
      Grade: record.grade.name,
    }));

  await fetchDataAndExport(query, transformer, "StudentReport");
}

export async function generateTeacherReport(): Promise<void> {
  const query = {
    model: "teacher",
    options: {
      include: {
        subjects: true,
        lessons: true,
        classes: true,
      },
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Username: record.username,
      Name: `${record.name} ${record.surname}`,
      Email: record.email || "N/A",
      Phone: record.phone || "N/A",
      Address: record.address,
      BloodType: record.bloodType,
      Sex: record.sex,
      Birthday: record.birthday.toISOString().split("T")[0],
      SubjectCount: record.subjects.length,
      LessonCount: record.lessons.length,
      ClassCount: record.classes.length,
    }));

  await fetchDataAndExport(query, transformer, "TeacherReport");
}

export async function generateClassReport(): Promise<void> {
  const query = {
    model: "class",
    options: {
      include: {
        supervisor: true,
        students: true,
        grade: true,
      },
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Name: record.name,
      Capacity: record.capacity,
      Supervisor: record.supervisor
        ? `${record.supervisor.name} ${record.supervisor.surname}`
        : "N/A",
      StudentCount: record.students.length,
      Grade: record.grade.name,
    }));

  await fetchDataAndExport(query, transformer, "ClassReport");
}

export async function generateSubjectReport(): Promise<void> {
  const query = {
    model: "subject",
    options: {
      include: {
        teachers: true,
      },
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Name: record.name,
      TeacherCount: record.teachers.length,
      Teachers: record.teachers
        .map((teacher) => `${teacher.name} ${teacher.surname}`)
        .join(", "),
    }));

  await fetchDataAndExport(query, transformer, "SubjectReport");
}

export async function generateLessonReport(): Promise<void> {
  const query = {
    model: "lesson",
    options: {
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    },
  };

  const transformer = (data: any[]) =>
    data.map((record) => ({
      Name: record.name,
      Day: record.day,
      StartTime: record.startTime.toISOString().split("T")[1].slice(0, 5),
      EndTime: record.endTime.toISOString().split("T")[1].slice(0, 5),
      Subject: record.subject.name,
      Class: record.class.name,
      Teacher: `${record.teacher.name} ${record.teacher.surname}`,
    }));

  await fetchDataAndExport(query, transformer, "LessonReport");
}

