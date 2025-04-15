import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function generateReport(type: string, params: any) {
  const { startDate, endDate, classId, studentId, teacherId } = params;

  let data;
  let reportData; // Use `let` to allow reassignment

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
      });
      reportData = data.map((record) => ({
        Date: record.date.toISOString().split("T")[0],
        Title: record.title,
        Description: record.description,
        Class: record.class?.name || "General",
      }));
      break;

    case "attendance":
      data = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          student: true,
          lesson: {
            include: {
              class: true,
            },
          },
        },
      });
      reportData = data.map((record) => ({
        Date: record.date.toISOString().split("T")[0],
        Student: `${record.student.name} ${record.student.surname}`,
        Class: record.lesson.class.name,
        Present: record.present ? "Yes" : "No",
      }));
      break;

    case "students":
      data = await prisma.student.findMany({
        include: {
          parent: true,
          class: true,
          grade: true,
        },
      });
      reportData = data.map((student) => ({
        Student: `${student.name} ${student.surname}`,
        Email: student.email || "N/A",
        Phone: student.phone || "N/A",
        Address: student.address,
        BloodType: student.bloodType,
        Class: student.class?.name || "N/A",
        Grade: student.grade?.level || "N/A",
        Parent: `${student.parent?.name || "N/A"} (${student.parent?.email || "N/A"})`,
      }));
      break;

    case "parents":
      data = await prisma.parent.findMany({
        include: {
          students: true,
        },
      });
      reportData = data.map((parent) => ({
        Name: `${parent.name} ${parent.surname}`,
        Email: parent.email || "N/A",
        Phone: parent.phone || "N/A",
        Address: parent.address,
        NumberOfStudents: parent.students.length,
        CreatedAt: parent.createdAt.toISOString().split("T")[0],
      }));
      break;

    case "lessons":
      data = await prisma.lesson.findMany({
        where: {
          startTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      });
      reportData = data.map((lesson) => ({
        Name: lesson.name,
        Day: lesson.day,
        StartTime: lesson.startTime.toISOString().split("T")[0],
        EndTime: lesson.endTime.toISOString().split("T")[0],
        Subject: lesson.subject.name,
        Class: lesson.class.name,
        Teacher: `${lesson.teacher.name} ${lesson.teacher.surname}`,
      }));
      break;

    case "subjects":
      data = await prisma.subject.findMany({
        include: {
          teachers: true,
          lessons: true,
        },
      });
      reportData = data.map((subject) => ({
        Name: subject.name,
        NumberOfTeachers: subject.teachers.length,
        NumberOfLessons: subject.lessons.length,
      }));
      break;

    case "assignments":
      data = await prisma.assignment.findMany({
        where: {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          lesson: {
            include: {
              class: true,
              subject: true,
            },
          },
        },
      });
      reportData = data.map((assignment) => ({
        Title: assignment.title,
        StartDate: assignment.startDate.toISOString().split("T")[0],
        DueDate: assignment.dueDate.toISOString().split("T")[0],
        Class: assignment.lesson.class.name,
        Subject: assignment.lesson.subject.name,
      }));
      break;

    case "classes":
      data = await prisma.class.findMany({
        include: {
          supervisor: true,
          students: true,
          lessons: true,
        },
      });
      reportData = data.map((cls) => ({
        Name: cls.name,
        Capacity: cls.capacity,
        Supervisor: cls.supervisor ? `${cls.supervisor.name} ${cls.supervisor.surname}` : "N/A",
        NumberOfStudents: cls.students.length,
        NumberOfLessons: cls.lessons.length,
      }));
      break;

    case "performance":
      data = await prisma.result.findMany({
        where: {
          AND: [
            { studentId: studentId },
            
          ],
        },
        include: {
          exam: true,
          assignment: true,
          student: true,
        },
      });
      
      let totalScore = 0;
      let maxPossibleScore = 0;
      
      reportData = data.map((record) => {
        const currentScore = record.score || 0;
        const currentMaxScore = record.maxScore || 
                              record.exam?.maxScore || 
                              record.assignment?.maxScore || 
                              100; // Default to 100 if no max score is found
        
        totalScore += currentScore;
        maxPossibleScore += currentMaxScore;
        
        return {
          Student: `${record.student.name} ${record.student.surname}`,
          Type: record.examId ? "Exam" : "Assignment",
          Title: record.exam?.title || record.assignment?.title || "N/A",
          Score: currentScore,
          "Max Score": currentMaxScore,
          "Percentage": ((currentScore / currentMaxScore) * 100).toFixed(2) + "%",
          Date: record.exam?.startTime?.toISOString().split("T")[0] ||
              record.assignment?.dueDate?.toISOString().split("T")[0] ||
              "N/A",
        };
      });

      // Add total row if there are records
      if (reportData.length > 0) {
        const totalPercentage = maxPossibleScore > 0 
            ? ((totalScore / maxPossibleScore) * 100).toFixed(2) + "%"
            : "N/A";
            
        reportData.push({
          Student: "TOTAL",
          Type: "",
          Title: "",
          Score: totalScore,
          "Max Score": maxPossibleScore,
          "Percentage": totalPercentage,
          Date: "",
        });
      }
      break;

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
      });
      reportData = data.map((record) => ({
        Title: record.title,
        Description: record.description,
        Start: record.startTime.toISOString().split("T")[0],
        End: record.endTime.toISOString().split("T")[0],
        Class: record.class?.name || "General",
      }));
      break;

    default:
      throw new Error("Invalid report type");
  }

  // Ensure reportData is defined and is an array
  if (!reportData || !Array.isArray(reportData)) {
    throw new Error("No data found for the selected criteria");
  }

  // Create Excel sheet
  const worksheet = XLSX.utils.json_to_sheet(reportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1));

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}