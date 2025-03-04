"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";  // Ensure eventSchema is defined
import { createEvent, updateEvent } from "@/lib/actions";  // Ensure these functions are properly defined
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EventForm = ({
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
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      startDate: data?.startDate || new Date().toISOString(), // Default to current date if not provided
      endTime: data?.endTime || new Date().toISOString(), // Default to current date if not provided
    },
  });

  // Manual state management for form submission status
  const [state, setState] = useState<{ success: boolean; error: boolean; message?: string }>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = async (formData: EventSchema) => {
    try {
      const formattedStartDate = new Date(formData.startDate).toISOString(); // Convert to ISO 8601 timestamp
      const formattedEndTime = new Date(formData.endTime).toISOString(); // Convert to ISO 8601 timestamp

      if (isNaN(new Date(formattedStartDate).getTime()) || isNaN(new Date(formattedEndTime).getTime())) {
        toast.error("Invalid date format!");
        return;
      }

      const formattedData = {
        ...formData,
        startDate: formattedStartDate, // Use the formatted timestamp for startDate
        endTime: formattedEndTime,     // Use the formatted timestamp for endTime
      };

      console.log("Submitting Data:", formattedData); // Debugging: Log submitted data

      // Call the appropriate action function based on the form type
      const actionFunction = type === "create" ? createEvent : updateEvent;
      const result = await actionFunction(formattedData);

      if (result.success) {
        setState({ success: true, error: false });
        toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
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

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Event Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
          type="text"
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          type="text"
        />
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Start Date</label>
          <input
            type="datetime-local"
            {...register("startDate")}
            defaultValue={data?.startDate}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.startDate?.message && (
            <p className="text-xs text-red-400">
              {errors.startDate.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">End Date</label>
          <input
            type="datetime-local"
            {...register("endTime")}
            defaultValue={data?.endTime}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.endTime?.message && (
            <p className="text-xs text-red-400">
              {errors.endTime.message.toString()}
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

export default EventForm;
