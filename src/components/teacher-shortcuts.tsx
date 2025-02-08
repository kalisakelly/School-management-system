import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TeacherShortcutsProps {
  teacherId: string
}

export function TeacherShortcuts({ teacherId }: TeacherShortcutsProps) {
  const shortcuts = [
    { title: "Classes", href: `/list/classes?supervisorId=${teacherId}`, color: "bg-blue-100" },
    { title: "Students", href: `/list/students?teacherId=${teacherId}`, color: "bg-purple-100" },
    { title: "Lessons", href: `/list/lessons?teacherId=${teacherId}`, color: "bg-yellow-100" },
    { title: "Exams", href: `/list/exams?teacherId=${teacherId}`, color: "bg-pink-100" },
    { title: "Assignments", href: `/list/assignments?teacherId=${teacherId}`, color: "bg-green-100" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {shortcuts.map((shortcut, index) => (
          <Button key={index} variant="outline" className={`w-full justify-start ${shortcut.color}`} asChild>
            <Link href={shortcut.href}>{shortcut.title}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

