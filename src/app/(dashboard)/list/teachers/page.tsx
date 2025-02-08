import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { TeachersTable } from "@/components/teachers-table"
import { Skeleton } from "@/components/ui/skeleton"
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { TeacherFormSheet } from "@/components/teacher-form-sheet"

async function getTeachers() {
  const teachers = await prisma.teacher.findMany({
    include: {
      subjects: true,
      classes: true,
    },
  })

  return teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    teacherId: teacher.username,
    subjects: teacher.subjects.map((subject) => subject.name),
    classes: teacher.classes.map((classItem) => classItem.name),
    phone: teacher.phone,
    address: teacher.address,
  }))
}

async function getSubjects() {
  return await prisma.subject.findMany({
    select: { id: true, name: true },
  })
}

export default async function TeachersPage() {
  const { sessionClaims } = auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (!role) {
    return []
  }

  const teachers = await getTeachers()
  const subjects = await getSubjects()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Teachers" description="Manage school's teachers" />

        {role === "admin" && (
          <TeacherFormSheet type="create" triggerButton={<Button>Add new Teacher</Button>} relatedData={{ subjects }} />
        )}
      </div>
      <Suspense fallback={<TeachersTableSkeleton />}>
        <TeachersTable data={teachers} />
      </Suspense>
    </div>
  )
}

function TeachersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="ml-auto h-8 w-[70px]" />
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-[400px] w-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[200px]" />
      </div>
    </div>
  )
}

