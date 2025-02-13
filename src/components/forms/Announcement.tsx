"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AnnouncementForm = ({
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
    reset, // To reset form values dynamically
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: data || {}, // Ensure defaultValues is always an object
  });

  // Manual state management for form submission status
  const [state, setState] = useState<{
    success: boolean;
    error: boolean;
    loading: boolean;
    message?: string;
  }>({
    success: false,
    error: false,
    loading: false,
  });

  const router = useRouter();

  const onSubmit = async (formData: AnnouncementSchema) => {
    try {
      setState({ success: false, error: false, loading: true }); // Start loading

      // Call the appropriate action function based on the form type
      const actionFunction = type === "create" ? createAnnouncement : updateAnnouncement;
      const result = await actionFunction(formData);

      if (result.success) {
        setState({ success: true, error: false, loading: false });
        toast(
          `${type === "create" ? "Created" : "Updated"} announcement successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        setState({
          success: false,
          error: true,
          loading: false,
          message: result.message || "Something went wrong!",
        });
        toast.error(result.message || "Something went wrong!");
      }
    } catch (error: any) {
      setState({
        success: false,
        error: true,
        loading: false,
        message: error.message || "An unexpected error occurred!",
      });
      toast.error(error.message || "An unexpected error occurred!");
    }
  };

  useEffect(() => {
    if (state.success) {
      // Reset state after a successful submission
      setTimeout(() => setState({ success: false, error: false, loading: false }), 3000);
    }
  }, [state]);

  const { classes = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new announcement"
          : "Update the announcement"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        {/* Title Field */}
        <InputField
          label="Title"
          name="title"
          register={register}
          defaultValue={data?.title}
          error={errors?.title}
        />
        {/* Description Field */}
        <InputField
          label="Description"
          name="description"
          register={register}
          defaultValue={data?.description}
          error={errors?.description}
        />
        {/* Date Field */}
        <InputField
          label="Date"
          name="date"
          type="datetime-local"
          register={register}
          error={errors?.date}
        />
        {/* Class Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class (Optional)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", { valueAsNumber: true })}
          >
            <option value="">None</option> {/* Add an option for no class */}
            {classes.map((classItem: { id: number; name: string }) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
          )}
        </div>
      </div>
      {/* Error Message */}
      {state.error && state.message && (
        <span className="text-red-500">{state.message}</span>
      )}
      {/* Submit Button */}
      <button
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={state.loading} // Disable button during submission
      >
        {state.loading
          ? "Saving..."
          : type === "create"
          ? "Create"
          : "Update"}
      </button>
    </form>
  );
};

export default AnnouncementForm;