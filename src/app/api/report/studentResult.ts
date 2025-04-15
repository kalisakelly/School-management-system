import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, sessionClaims } = getAuth(req);
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "student" || !userId) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  try {
    const results = await prisma.result.findMany({
      where: { studentId: userId },
      include: {
        exam: true,
        assignment: true,
        student: true,
      },
    });

    const reportData = results.map((record) => ({
      Student: `${record.student.name} ${record.student.surname}`,
      Type: record.examId ? "Exam" : "Assignment",
      Title: record.exam?.title || record.assignment?.title || "N/A",
      Score: record.score,
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Results");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=StudentResults.xlsx`);
    res.status(200).end(excelBuffer); // ✅ FIXED: use .end instead of .send
  } catch (error) {
    console.error("Error generating student result report:", error);
    res.status(500).json({ error: "Failed to generate result report" });
  }
}
