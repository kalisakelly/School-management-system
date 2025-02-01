"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReportPage = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState<string>("announcement");
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");

  // Handler for Announcement Report
  const handleAnnouncementReport = async () => {
    try {
      if (startDate && endDate) {
        await fetchReport("announcement");
      } else {
        alert("Please select a date range!");
      }
    } catch (error) {
      console.error("Error generating announcement report:", error);
      alert("Failed to generate the announcement report!");
    }
  };

  // Handler for Attendance Report
  const handleAttendanceReport = async () => {
    try {
      if (startDate && endDate) {
        await fetchReport("attendance", { classId, studentId });
      } else {
        alert("Please select a date range!");
      }
    } catch (error) {
      console.error("Error generating attendance report:", error);
      alert("Failed to generate the attendance report!");
    }
  };

  // Handler for Student Performance Report
  const handlePerformanceReport = async () => {
    try {
      if (studentId) {
        await fetchReport("performance", { studentId, startDate, endDate });
      } else {
        alert("Please provide a student ID!");
      }
    } catch (error) {
      console.error("Error generating performance report:", error);
      alert("Failed to generate the performance report!");
    }
  };

  // Handler for Class Event Report
  const handleEventReport = async () => {
    try {
      if (classId && startDate && endDate) {
        await fetchReport("events", { classId, startDate, endDate });
      } else {
        alert("Please provide a class ID and date range!");
      }
    } catch (error) {
      console.error("Error generating event report:", error);
      alert("Failed to generate the event report!");
    }
  };

  // Handler for Teacher Assignment Report
  const handleAssignmentReport = async () => {
    try {
      if (teacherId && startDate && endDate) {
        await fetchReport("assignments", { teacherId, startDate, endDate });
      } else {
        alert("Please provide a teacher ID and date range!");
      }
    } catch (error) {
      console.error("Error generating assignment report:", error);
      alert("Failed to generate the assignment report!");
    }
  };

  // Handler for Class Composition Report
  const handleClassCompositionReport = async () => {
    try {
      if (classId) {
        await fetchReport("class-composition", { classId });
      } else {
        alert("Please provide a class ID!");
      }
    } catch (error) {
      console.error("Error generating class composition report:", error);
      alert("Failed to generate the class composition report!");
    }
  };

  // Generic function to fetch reports
  const fetchReport = async (type: string, params: any = {}) => {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          type,
          ...params,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type.charAt(0).toUpperCase() + type.slice(1)}Report.xlsx`;
        link.click();
      } else {
        const { error } = await response.json();
        throw new Error(error || "Failed to generate report");
      }
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      alert(`Failed to generate the ${type} report!`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold ">Generate Reports</h1>
      <div className="mb-4">
        <label className="block mb-2">Select Date Range:</label>
        <div className="flex gap-4">
          <div>
            <label>Start Date:</label>
            <DatePicker className='text-xl font-bold border border-black rounded-2 'selected={startDate} onChange={(date) => setStartDate(date)} />
          </div>
          <div>
            <label>End Date:</label>
            <DatePicker className='text-xl font-bold border border-black rounded-2' selected={endDate} onChange={(date) => setEndDate(date)} />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Select Report Type:</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="announcement">Announcement Report</option>
          <option value="attendance">Attendance Report</option>
          <option value="performance">Student Performance Report</option>
          <option value="events">Class Event Report</option>
          <option value="assignments">Teacher Assignment Report</option>
          <option value="class-composition">Class Composition Report</option>
        </select>
      </div>

      {reportType === "attendance" && (
        <div className="mb-4">
          <label className="block mb-2">Class ID or Student ID (Optional):</label>
          <input
            type="text"
            placeholder="Enter Class ID or Student ID"
            value={classId || studentId}
            onChange={(e) => setClassId(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {reportType === "performance" && (
        <div className="mb-4">
          <label className="block mb-2">Student ID:</label>
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {reportType === "events" && (
        <div className="mb-4">
          <label className="block mb-2">Class ID:</label>
          <input
            type="text"
            placeholder="Enter Class ID"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {reportType === "assignments" && (
        <div className="mb-4">
          <label className="block mb-2">Teacher ID:</label>
          <input
            type="text"
            placeholder="Enter Teacher ID"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {reportType === "class-composition" && (
        <div className="mb-4">
          <label className="block mb-2">Class ID:</label>
          <input
            type="text"
            placeholder="Enter Class ID"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      <button
        className="bg-green-500 text-white p-2 rounded"
        onClick={() => {
          switch (reportType) {
            case "announcement":
              handleAnnouncementReport();
              break;
            case "attendance":
              handleAttendanceReport();
              break;
            case "performance":
              handlePerformanceReport();
              break;
            case "events":
              handleEventReport();
              break;
            case "assignments":
              handleAssignmentReport();
              break;
            case "class-composition":
              handleClassCompositionReport();
              break;
            default:
              alert("Invalid report type!");
          }
        }}
      >
        Generate Report
      </button>
    </div>
  );
};

export default ReportPage;