import type { Teacher, Subject, Class } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MailIcon, PhoneIcon, MapPinIcon } from "lucide-react"
import { format } from "date-fns"
import { TeacherFormSheet } from "@/components/teacher-form-sheet"

interface TeacherDetailsProps {
  teacher: Teacher & {
    subjects: Subject[]
    classes: Class[]
  }
  relatedData: {
    subjects: { id: number; name: string }[]
  }
}

export function TeacherDetails({ teacher, relatedData }: TeacherDetailsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={teacher.img || undefined} alt={teacher.name} />
                <AvatarFallback>
                  {teacher.name[0]}
                  {teacher.surname[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {teacher.name} {teacher.surname}
                </h2>
                <p className="text-sm text-muted-foreground">Teacher ID: {teacher.username}</p>
              </div>
            </div>
            <TeacherFormSheet
              type="update"
              triggerButton={<Button>Edit Teacher</Button>}
              teacher={teacher}
              relatedData={relatedData}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <MailIcon className="mr-2 h-4 w-4" />
              <span>{teacher.email}</span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="mr-2 h-4 w-4" />
              <span>{teacher.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="mr-2 h-4 w-4" />
              <span>{teacher.address}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Born on {format(new Date(teacher.birthday), "MMMM d, yyyy")}</span>
            </div>
          </div>
          <div>
            <p>Blood Type: {teacher.bloodType}</p>
            <p>Sex: {teacher.sex}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((subject) => (
                <Badge key={subject.id} variant="secondary">
                  {subject.name}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Classes</h3>
            <div className="flex flex-wrap gap-2">
              {teacher.classes.map((class_) => (
                <Badge key={class_.id} variant="outline">
                  {class_.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

