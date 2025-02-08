// src\reports\announcements.ts
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { startDate, endDate, type } = req.body;
  console.log("Request Body:", req.body); // Debug: Log the request body

  try {
    if (type === "announcement") {
      const data = await prisma.announcement.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: { class: true },
      });

      // Transform data for the Excel file
      const reportData = data.map((record) => ({
        Date: record.date.toISOString().split("T")[0],
        Title: record.title,
        Description: record.description,
        Class: record.class?.name || "General",
      }));

      console.log("Report Data:", reportData); // Debug: Log the data

      // Create a worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Announcements");

      console.log("Workbook:", workbook); // Debug: Log the workbook

      // Write the workbook to a buffer
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

      console.log("Buffer Length:", excelBuffer.length); // Debug: Log the buffer length

      // Set headers for file download
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=AnnouncementReport.xlsx`);

      // Send the buffer to the client
      res.status(200).send(excelBuffer); // Use res.send() for binary data
    } 
    if (type === "class-composition") {
      const data = await prisma.student.findMany({
        where: { classId: req.body.classId },
        include: { class: true },
      });
    
      const reportData = data.map((student) => ({
        Name: `${student.name} ${student.surname}`,
        Email: student.email || "N/A",
        Phone: student.phone || "N/A",
        Address: student.address,
        BloodType: student.bloodType,
        Sex: student.sex,
        Class: student.class.name,
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Class Composition Report");
    
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=ClassCompositionReport.xlsx`);
      res.status(200).send(excelBuffer);
    }
    if (type === "assignments") {
      const data = await prisma.assignment.findMany({
        where: {
          AND: [
            { lesson: { teacherId: req.body.teacherId } },
            {
              startDate: { gte: new Date(startDate) },
              dueDate: { lte: new Date(endDate) },
            },
          ],
        },
        include: { lesson: { include: { teacher: true } } },
      });
    
      const reportData = data.map((record) => ({
        Title: record.title,
        Start: record.startDate.toISOString().split("T")[0],
        Due: record.dueDate.toISOString().split("T")[0],
        Teacher: `${record.lesson.teacher.name} ${record.lesson.teacher.surname}`,
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Assignment Report");
    
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=AssignmentReport.xlsx`);
      res.status(200).send(excelBuffer);
    }
    if (type === "events") {
      const data = await prisma.event.findMany({
        where: {
          AND: [
            { classId: req.body.classId },
            {
              startTime: { gte: new Date(startDate) },
              endTime: { lte: new Date(endDate) },
            },
          ],
        },
        include: { class: true },
      });
    
      const reportData = data.map((record) => ({
        Title: record.title,
        Description: record.description,
        Start: record.startTime.toISOString().split("T")[0],
        End: record.endTime.toISOString().split("T")[0],
        Class: record.class?.name || "General",
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Event Report");
    
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=EventReport.xlsx`);
      res.status(200).send(excelBuffer);
    }

    if (type === "performance") {
      const data = await prisma.result.findMany({
        where: {
          AND: [
            { studentId: req.body.studentId },
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
      });
    
      const reportData = data.map((record) => ({
        Type: record.examId ? "Exam" : "Assignment",
        Title: record.exam?.title || record.assignment?.title || "N/A",
        Score: record.score,
        Date: record.exam?.startTime?.toISOString().split("T")[0] || record.assignment?.dueDate?.toISOString().split("T")[0] || "N/A",
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Report");
    
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=PerformanceReport.xlsx`);
      res.status(200).send(excelBuffer);
    }
    if (type === "attendance") {
      const data = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          OR: [
            { studentId: req.body.studentId }, // Filter by student ID if provided
            { lesson: { classId: req.body.classId } }, // Filter by class ID if provided
          ],
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
    
      const reportData = data.map((record) => ({
        Date: record.date.toISOString().split("T")[0],
        Student: `${record.student.name} ${record.student.surname}`,
        Class: record.lesson.class.name,
        Present: record.present ? "Yes" : "No",
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
    
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=AttendanceReport.xlsx`);
      res.status(200).send(excelBuffer);
    }

    else {
      res.status(400).json({ error: "Invalid report type" });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
}