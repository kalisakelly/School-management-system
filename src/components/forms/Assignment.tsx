"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AssignmentForm = ({
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
  // Initialize form with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: data || {},
  });

  // State management for success, error, loading, and message
  const [state, setState] = useState({
    success: false,
    error: false,
    loading: false,
    message: "",
  });

  // Next.js router for page refresh
  const router = useRouter();

  // Handle form submission
  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  // Reset success/error states after a delay
  useEffect(() => {
    if (state.success) {
      setTimeout(() => setState({ success: false, error: false, loading: false, message: "" }), 3000);
    }
  }, [state]);

  // Extract lessons from relatedData with fallback
  const lessons = relatedData?.lessons || [];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      {/* Form Header */}
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new assignment" : "Update the assignment"}
      </h1>

      {/* Form Fields */}
      <div className="flex justify-between flex-wrap gap-4">
        {/* Title Field */}
        <InputField
          label="Title"
          name="title"
          register={register}
          defaultValue={data?.title}
          error={errors?.title}
        />


        <InputField
          label="Start Date"
          name="startDate"
          type="datetime-local"
          register={register}
          defaultValue={data?.startDate}
          error={errors?.startDate}
        />


        {/* Description Field */}
        <InputField
          label="Due Date"
          name="dueDate"
          type="datetime-local"
          register={register}
          defaultValue={data?.dueDate}
          error={errors?.dueDate}
        />
       
        {/* Lesson Selection Dropdown */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId || ""}
          >
            <option value="" disabled>Select a lesson</option>
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

      {/* Error Message */}
      {state.error && state.message && (
        <span className="text-red-500">{state.message}</span>
      )}

      {/* Submit Button */}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;