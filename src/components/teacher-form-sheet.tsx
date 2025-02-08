"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import TeacherForm from "@/components/forms/TeacherForm"
import type { Subject, Class, UserSex } from "@prisma/client"

interface Teacher {
  id: string
  name: string
  username: string
  surname: string
  email?: string
  phone?: string
  address: string
  img?: string
  bloodType: string
  sex: UserSex
  createdAt: Date
  birthday: Date
  subjects: Subject[]
  classes: Class[]
}

interface TeacherFormSheetProps {
  type: "create" | "update"
  triggerButton: React.ReactNode
  teacher?: Teacher & {
    subjects: Subject[]
    classes: Class[]
  }
  relatedData?: {
    subjects: { id: number; name: string }[]
  }
}

export function TeacherFormSheet({ type, triggerButton, teacher, relatedData }: TeacherFormSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{triggerButton}</SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] md:w-[1200px]">
        <SheetHeader>
          <SheetTitle>{type === "create" ? "Add New Teacher" : "Edit Teacher"}</SheetTitle>
        </SheetHeader>
        <TeacherForm type={type} data={teacher} setOpen={setOpen} relatedData={relatedData} />
      </SheetContent>
    </Sheet>
  )
}

