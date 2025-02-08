"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "react-toastify"
import type { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange"
import { Loader } from "lucide-react"
import { subDays } from "date-fns"

const ReportPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [reportType, setReportType] = useState<string>("announcement")
  const [classId, setClassId] = useState<string>("")
  const [studentId, setStudentId] = useState<string>("")
  const [teacherId, setTeacherId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: dateRange.from,
          endDate: dateRange.to,
          type: reportType,
          classId,
          studentId,
          teacherId,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}Report.xlsx`
        link.click()
        toast.success("Report generated successfully!")
      } else {
        const { error } = await response.json()
        throw new Error(error || "Failed to generate report")
      }
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error)
      toast.error(`Failed to generate the ${reportType} report!`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-none">
     <h3 className="text-xl pl-5 py-4 font-semibold">Generate Report</h3>
      <CardContent className="space-y-6 ">
        <div className="space-y-2">
          <Label htmlFor="dateRange" className="">
            Date Range
          </Label>
          <DatePickerWithRange value={dateRange} onChange={(newDateRange) => setDateRange(newDateRange as DateRange | undefined)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportType" className="">
            Report Type
          </Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="reportType" className="w-full">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement">Announcement Report</SelectItem>
              <SelectItem value="attendance">Attendance Report</SelectItem>
              <SelectItem value="performance">Student Performance Report</SelectItem>
              <SelectItem value="events">Class Event Report</SelectItem>
              <SelectItem value="assignments">Teacher Assignment Report</SelectItem>
              <SelectItem value="class-composition">Class Composition Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reportType === "attendance" && (
          <div className="space-y-2">
            <Label htmlFor="classOrStudentId" className="">
              Class ID or Student ID (Optional)
            </Label>
            <Input
              id="classOrStudentId"
              type="text"
              placeholder="Enter Class ID or Student ID"
              value={classId || studentId}
              onChange={(e) => (classId ? setClassId(e.target.value) : setStudentId(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {reportType === "performance" && (
          <div className="space-y-2">
            <Label htmlFor="studentId" className="">
              Student ID
            </Label>
            <Input
              id="studentId"
              type="text"
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {(reportType === "events" || reportType === "class-composition") && (
          <div className="space-y-2">
            <Label htmlFor="classId" className="">
              Class ID
            </Label>
            <Input
              id="classId"
              type="text"
              placeholder="Enter Class ID"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {reportType === "assignments" && (
          <div className="space-y-2">
            <Label htmlFor="teacherId" className="">
              Teacher ID
            </Label>
            <Input
              id="teacherId"
              type="text"
              placeholder="Enter Teacher ID"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full text font-semibold">
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Report"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ReportPage

