import React, { KeyboardEvent } from "react";
import { AIFilterResponse } from "../lib/schema";

interface AIPromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  response: AIFilterResponse | null;
  processing: boolean;
  submitPrompt: () => Promise<void>;
  clearPrompt: () => void;
  placeholderText?: string;
}

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
  prompt,
  setPrompt,
  response,
  processing,
  submitPrompt,
  clearPrompt,
  placeholderText = 'Ask AI to filter data (e.g., "Show completed items")',
}) => {
  // Handle Enter key to submit
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitPrompt();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center border rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className="flex-grow px-4 py-3 focus:outline-none"
          disabled={processing}
          aria-label="AI filter prompt"
        />

        {prompt && (
          <button
            onClick={clearPrompt}
            className="p-3 text-gray-400 hover:text-gray-600"
            type="button"
            aria-label="Clear prompt"
            disabled={processing}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <button
          onClick={submitPrompt}
          className={`px-4 py-3 text-white ${
            processing ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
          type="button"
          disabled={processing || !prompt.trim()}
          aria-label="Submit prompt to AI"
        >
          {processing ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <span>Ask AI</span>
          )}
        </button>
      </div>

      {response && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm ${
            response.filters || response.sort
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
          }`}
        >
          <p>{response.explanation}</p>
        </div>
      )}
    </div>
  );
};
