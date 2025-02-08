import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Teacher } from "@prisma/client"
import { BookOpen, Users, Calendar, GraduationCap } from "lucide-react"

interface TeacherQuickStatsProps {
  teacher: Teacher & {
    _count: {
      subjects: number
      lessons: number
      classes: number
    }
  }
  className?: string
}

export function TeacherQuickStats({ teacher, className }: TeacherQuickStatsProps) {
  const stats = [
    { title: "Attendance", value: "90%", icon: Calendar },
    { title: "Subjects", value: teacher._count.subjects, icon: BookOpen },
    { title: "Lessons", value: teacher._count.lessons, icon: GraduationCap },
    { title: "Classes", value: teacher._count.classes, icon: Users },
  ]

  return (
    <div className={`grid gap-4 md:grid-cols-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

