"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";

export default function DownloadResultsButton() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "performance",
          studentId: user?.id // Assuming the studentId is the same as the user's Clerk ID
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to download report');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        toast.warning("No results found for this student.");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MyResults.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Results downloaded successfully!");
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download results');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isLoading}
      className="flex items-center gap-2 bg-lamaPurple text-white px-4 py-2 rounded-md hover:bg-lamaPurpleDark disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          <span>Downloading...</span>
        </>
      ) : (
        <span>Download My Results</span>
      )}
    </button>
  );
}