import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { startDate, endDate, type } = req.body;

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
    } else {
      res.status(400).json({ error: "Invalid report type" });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
}