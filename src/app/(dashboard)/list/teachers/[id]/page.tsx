import { Suspense } from "react"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { TeacherDetails } from "@/components/teacher-details"
import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@clerk/nextjs/server"
import Announcements from "@/components/Announcements"
import Performance from "@/components/Performance"
import BigCalendarContainer from "@/components/BigCalendarContainer"
import { TeacherQuickStats } from "@/components/teacher-quick-stats"
import { TeacherShortcuts } from "@/components/teacher-shortcuts"

async function getTeacher(id: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      subjects: true,
      classes: true,
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  })

  if (!teacher) {
    notFound()
  }

  return teacher
}

export default async function TeacherPage({ params }: { params: { id: string } }) {
  const { sessionClaims } = auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (!role) {
    return []
  }

  const teacherSubjects = await prisma.subject.findMany({
    select: { id: true, name: true },
  });

  const relatedData = { subjects: teacherSubjects };

  const teacher = await getTeacher(params.id)

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={`${teacher.name} ${teacher.surname}`}
        description="Teacher Details"
      />
      <div className="grid gap-6 ">
        <Suspense fallback={<Skeleton className="h-[400px] md:col-span-2 lg:col-span-3" />}>
          <TeacherDetails teacher={teacher} relatedData={relatedData}/> 
        </Suspense>
   
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Suspense fallback={<Skeleton className="h-[400px] md:col-span-2 lg:col-span-4" />}>
          <TeacherQuickStats teacher={teacher} className="md:col-span-2 lg:col-span-4" />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] lg:col-span-2" />}>
          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <h2 className="text-lg font-semibold p-4 border-b">Teacher&apos;s Schedule</h2>
            <BigCalendarContainer type="teacherId" id={teacher.id} />
          </div>
        </Suspense>
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <TeacherShortcuts teacherId={teacher.id} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <Performance />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <Announcements />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
