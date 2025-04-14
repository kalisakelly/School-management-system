"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Helper to convert ISO date to local datetime input format
const toLocalDatetime = (isoDate: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16); // Keep only "yyyy-MM-ddTHH:mm"
};

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
      startTime: data?.startTime || new Date().toISOString(),
      endTime: data?.endTime || new Date().toISOString(),
    }
  });

  const [state, setState] = useState<{ success: boolean; error: boolean; message?: string }>({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = async (formData: EventSchema) => {
    try {
      const formattedData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      const actionFunction = type === "create" ? createEvent : updateEvent;
      const result = await actionFunction(formattedData);

      if (result.success) {
        setState({ success: true, error: false });
        toast.success(`Event has been ${type === "create" ? "created" : "updated"}!`);
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
      register={register}
      error={errors?.title}
      type="text"
    />
    <InputField
      label="Description"
      name="description"
      register={register}
      error={errors?.description}
      type="text"
    />
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-500">Start Date</label>
      <input
          type="datetime-local"
          {...register("startTime")}
          defaultValue={data?.startTime}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        />

      {errors.startTime?.message && (
        <p className="text-xs text-red-400">{errors.startTime.message}</p>
      )}
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-500">End Date</label>
      <input
        type="datetime-local"
        {...register("endTime")}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
      />
      {errors.endTime?.message && (
        <p className="text-xs text-red-400">{errors.endTime.message}</p>
      )}
    </div>
  </div>

  {state.error && state.message && (
    <span className="text-red-500">{state.message}</span>
  )}

  <button
    type="submit"
    className="bg-blue-400 text-white p-2 rounded-md"
  >
    {type === "create" ? "Create" : "Update"}
  </button>
</form>

  );
};

export default EventForm;
