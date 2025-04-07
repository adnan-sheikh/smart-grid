import { useState } from "react";
import { SortParams, FilterParams, AIFilterResponse } from "./schema";

interface UseAIFilterParams {
  entityType: "todos" | "posts";
  onFilterChange: (filters?: FilterParams) => void;
  onSortChange: (sort?: SortParams) => void;
}

interface UseAIFilterReturn {
  prompt: string;
  setPrompt: (value: string) => void;
  response: AIFilterResponse | null;
  processing: boolean;
  submitPrompt: () => Promise<void>;
  clearPrompt: () => void;
}

export function useAIFilter({
  entityType,
  onFilterChange,
  onSortChange,
}: UseAIFilterParams): UseAIFilterReturn {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<AIFilterResponse | null>(null);
  const [processing, setProcessing] = useState(false);

  const submitPrompt = async () => {
    if (!prompt.trim()) return;

    setProcessing(true);

    try {
      // Call the backend API endpoint for AI filtering
      const result = await fetch("https://api.example.com/ai-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          prompt,
        }),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || "An error occurred");
      }

      const data = await result.json();

      if (data.success && data.result) {
        // Extract the filter response
        const filterResponse = data.result as AIFilterResponse;

        // Update the response
        setResponse(filterResponse);

        // Apply filters and sort if they exist
        if (filterResponse.filters) {
          onFilterChange(filterResponse.filters);
        }

        if (filterResponse.sort) {
          onSortChange(filterResponse.sort);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating filters:", error);
      setResponse({
        explanation: "Sorry, there was an error processing your request.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const clearPrompt = () => {
    setPrompt("");
    setResponse(null);
    onFilterChange(undefined);
    onSortChange(undefined);
    setProcessing(false);
  };

  return {
    prompt,
    setPrompt,
    response,
    processing,
    submitPrompt,
    clearPrompt,
  };
}
