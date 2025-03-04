"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Function to format date for datetime-local inputs
const formatDate = (date: string | undefined) => {
  return date ? new Date(date).toISOString().slice(0, 16) : "";
};

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData = {},
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
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: data?.title || "",
      startDate: data?.startDate ? formatDate(data.startDate) : "", // Format date if provided
      dueDate: data?.dueDate ? formatDate(data.dueDate) : "",
      lessonId: 1,
    },
  });

  const [state, setState] = useState<{ success: boolean; error: boolean; message?: string }>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = async (formData: AssignmentSchema) => {
    try {
      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      const actionFunction = type === "create" ? createAssignment : updateAssignment;
      const result = await actionFunction(formattedData);

      if (result.success) {
        setState({ success: true, error: false });
        toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
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

  // Destructure lessons from relatedData (if it exists)
  const { lessons = [] } = relatedData || {};

  

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new assignment" : "Update the assignment"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
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
          defaultValue={formatDate(data?.startDate)}
          error={errors?.startDate}
        />

        <InputField
          label="Due Date"
          name="dueDate"
          type="datetime-local"
          register={register}
          defaultValue={formatDate(data?.dueDate)}
          error={errors?.dueDate}
        />

<InputField
  label="Lesson"
  name="lessonId"
  type="number"
  register={register}  // This assumes you're using react-hook-form for validation
  defaultValue=""      // You can set an initial default value if needed
  error={errors?.lessonId} // Error handling for the lessonId
/>

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

export default AssignmentForm;
