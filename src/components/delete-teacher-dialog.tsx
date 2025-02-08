"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { deleteTeacher } from "@/lib/actions"
import { toast } from "react-toastify"

interface DeleteTeacherDialogProps {
  teacherId: string
  teacherName: string
  onDelete: () => void
}

export function DeleteTeacherDialog({ teacherId, teacherName, onDelete }: DeleteTeacherDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  

  const handleDelete = async () => {
    const formData = new FormData()
    formData.append("id", teacherId)
    const result = await deleteTeacher({ success: false, error: false }, formData)

    if (result.success) {
      toast(`${teacherName} has been successfully deleted.`)
      onDelete()
    } else {
      toast.error("Failed to delete the teacher. Please try again.")
    }
    setOpen(false)
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the teacher account and remove their data from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <p className="text-sm text-muted-foreground mb-2">Type DELETE to confirm</p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={confirmText !== "DELETE"}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

