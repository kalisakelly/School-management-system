"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReportPage = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleAnnouncementReport = async () => {
    try {
      if (startDate && endDate) {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            type: "announcement",
          }),
        });
  
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "AnnouncementReport.xlsx";
          link.click();
        } else {
          const { error } = await response.json();
          throw new Error(error || "Failed to generate report");
        }
      } else {
        alert("Please select a date range!");
      }
    } catch (error) {
      console.error("Error generating announcement report:", error);
      alert("Failed to generate the announcement report!");
    }
  };
  

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Generate Reports</h1>
      <div className="flex gap-4 my-4">
        <div>
          <label>Start Date:</label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        </div>
        <div>
          <label>End Date:</label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
        </div>
      </div>
      <div className="flex gap-4">
        <button className="bg-green-500 text-white p-2 rounded" onClick={handleAnnouncementReport}>
          Download Announcement Report
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
