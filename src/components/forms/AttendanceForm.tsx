"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: data?.date || new Date().toISOString(), // Default to current date if not provided
      present: data?.present || false,
      studentId: data?.studentId || "",
      lessonId: data?.lessonId || null,
    },
  });

  // Manual state management for form submission status
  const [state, setState] = useState<{ success: boolean; error: boolean; message?: string }>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = async (formData: AttendanceSchema) => {
    try {
      const formattedDate = new Date(formData.date).toISOString(); // Convert to ISO 8601 timestamp
      if (isNaN(new Date(formattedDate).getTime())) {
        toast.error("Invalid date format!");
        return;
      }

      const formattedData = {
        ...formData,
        date: formattedDate, // Use the formatted timestamp
      };

      console.log("Submitting Data:", formattedData); // Debugging: Log submitted data

      // Call the appropriate action function based on the form type
      const actionFunction = type === "create" ? createAttendance : updateAttendance;
      const result = await actionFunction(formattedData);

      if (result.success) {
        setState({ success: true, error: false });
        toast(`Attendance has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        setState({ success: false, error: true, message: result.message });
        toast.error(result.message || "Something went wrong!");
      }
    } catch (error: any) {
      setState({ success: false, error: true, message: error.message });
      toast.error(error.message || "An unexpected error occurred!");
    }
  };

  useEffect(() => {
    if (state.success) {
      // Reset state after a successful submission
      setTimeout(() => setState({ success: false, error: false }), 3000);
    }
  }, [state]);

  const { students = [], lessons = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new attendance" : "Update the attendance"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Date"
          name="date"
          defaultValue={data?.date}
          register={register}
          error={errors?.date}
          type="datetime-local"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Present</label>
          <input
            type="checkbox"
            {...register("present")}
            defaultChecked={data?.present}
          />
          {errors.present?.message && (
            <p className="text-xs text-red-400">
              {errors.present.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId}
          >
            {students.map((student: { id: string; name: string }) => (
              <option value={student.id} key={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId", { valueAsNumber: true })}
            defaultValue={data?.lessonId}
          >
            {lessons.map((lesson: { id: number; name: string }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && state.message && (
        <span className="text-red-500">{state.message}</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;