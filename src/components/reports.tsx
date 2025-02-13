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
  const [lessonId, setLessonId] = useState<string>("") // New field for lesson ID
  const [present, setPresent] = useState<string | null>(null) // New field for present/absent status
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
          lessonId: lessonId || undefined, // Send only if provided
          present: present === "Yes" ? true : present === "No" ? false : undefined, // Convert to boolean
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
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="dateRange" className="">
            Date Range
          </Label>
          <DatePickerWithRange value={dateRange} onChange={(newDateRange) => setDateRange(newDateRange as DateRange | undefined)} />
        </div>

        {/* Report Type */}
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

        {/* Attendance Report Fields */}
        {reportType === "attendance" && (
          <>
            {/* Class ID or Student ID */}
            <div className="space-y-2">
              <Label htmlFor="classOrStudentId" className="">
                Class ID or Student ID (Optional)
              </Label>
              <Input
                id="classOrStudentId"
                type="number"
                placeholder="Enter Class ID or Student ID"
                value={classId || studentId}
                onChange={(e) => (classId ? setClassId(e.target.value) : setStudentId(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Lesson ID */}
            <div className="space-y-2">
              <Label htmlFor="lessonId" className="">
                Lesson ID (Optional)
              </Label>
              <Input
                id="lessonId"
                type="number"
                placeholder="Enter Lesson ID"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Present/Absent Status */}
            <div className="space-y-2">
              <Label htmlFor="present" className="">
                Present/Absent (Optional)
              </Label>
              <Select value={present} onValueChange={setPresent}>
                <SelectTrigger id="present" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Present</SelectItem>
                  <SelectItem value="No">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Generate Report Button */}
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