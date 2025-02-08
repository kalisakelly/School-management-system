"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { teacherSchema, type TeacherSchema } from "@/lib/formValidationSchemas"
import { useFormState, useFormStatus } from "react-dom"
import { createTeacher, updateTeacher } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { CldUploadWidget } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2, UploadIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MultiSelect } from "@/components/ui/multi-select"

interface TeacherFormProps {
  type: "create" | "update"
  data?: Partial<TeacherSchema>
  setOpen: Dispatch<SetStateAction<boolean>>
  relatedData?: {
    subjects: { id: number; name: string }[]
  }
}

const TeacherForm = ({ type, data, setOpen, relatedData }: TeacherFormProps) => {
  const form = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      ...data,
      birthday: data?.birthday ? new Date(data.birthday) : undefined,
      subjects: (data?.subjects as unknown as { id: number }[])?.map((subject) => subject.id.toString()) || [],
    },
  })

  const [img, setImg] = useState<{ secure_url: string } | null>(null)

  const [state, formAction] = useFormState(type === "create" ? createTeacher : updateTeacher, {
    success: false,
    error: false,
  })

  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`)
      setOpen(false)
      router.refresh()
    }
  }, [state, router, type, setOpen])

  const onSubmit = (formData: TeacherSchema) => {
    const submissionData = {
      ...formData,
      img: img?.secure_url || data?.img,
      subjects: Array.isArray(formData.subjects) ? formData.subjects : [],
    }
    formAction(submissionData)
  }

  const { pending } = useFormStatus()
  const subjectOptions =
  relatedData?.subjects.map((subject) => ({
    label: subject.name,
    value: subject.id.toString(),
  })) || []

  return (
    <Sheet open={true} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] md:w-[1200px]">
        <SheetHeader>
          <SheetTitle>{type === "create" ? "Create a new teacher" : "Update teacher"}</SheetTitle>
          <SheetDescription>Enter the teacher&apos;s information below.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] mt-6  pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          {type === "update" && "Leave blank to keep the current password."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="123 Main St, City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a blood type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Birthday</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Sex</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="MALE" />
                              </FormControl>
                              <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="FEMALE" />
                              </FormControl>
                              <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <MultiSelect
                        options={subjectOptions}
                        onValueChange={(selected) => field.onChange(selected)}
                        defaultValue={field.value}
                        placeholder="Select subjects"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center w-full">
                  <Label>Profile Picture</Label>
                  <CldUploadWidget
                    uploadPreset="school"
                    onSuccess={(result: any) => {
                      setImg(result.info)
                    }}
                  >
                    {({ open }) => (
                      <Button type="button" variant="outline" onClick={() => open()}>
                        <UploadIcon className="mr-4 h-4 w-4" /> Upload Image
                      </Button>
                    )}
                  </CldUploadWidget>
                  {(img?.secure_url || data?.img) && (
                    <p className="mt-2 text-sm text-muted-foreground">Image uploaded: {img?.secure_url || data?.img}</p>
                  )}
                </div>

                {state.error && <p className="text-sm font-medium text-destructive">Something went wrong!</p>}
              </div>

              <div className="flex justify-end py-4">
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {type === "create" ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>{type === "create" ? "Create Teacher" : "Update Teacher"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default TeacherForm

