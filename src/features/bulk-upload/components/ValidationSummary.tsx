import React from "react";
import { UploadSummary, ValidationError } from "../types";
import { useGroupedValidationErrors } from "../hooks/useDataValidation";

interface ValidationSummaryProps {
  summary: UploadSummary;
  onViewErrors?: (rowIndex: number) => void;
  className?: string;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  summary,
  onViewErrors,
  className,
}) => {
  const { totalRows, validRows, invalidRows, errors } = summary;
  const groupedErrors = useGroupedValidationErrors(errors);

  // Calculate percentage for the progress bar
  const percentValid = Math.round((validRows / totalRows) * 100);

  // Get top 5 rows with errors to display
  const topErrorRows = Object.keys(groupedErrors)
    .map(Number)
    .sort((a, b) => groupedErrors[b].length - groupedErrors[a].length)
    .slice(0, 5);

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800">
          Validation Summary
        </h3>

        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {validRows} of {totalRows} rows valid ({percentValid}%)
            </span>
            <span className="text-sm font-medium text-gray-700">
              {invalidRows} rows with errors
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                percentValid >= 90
                  ? "bg-green-500"
                  : percentValid >= 70
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${percentValid}%` }}
            ></div>
          </div>
        </div>

        {invalidRows > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Common Issues
            </h4>

            <div className="max-h-60 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Row
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Errors
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topErrorRows.map((rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rowIndex}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <ul className="list-disc pl-5">
                          {groupedErrors[rowIndex]
                            .slice(0, 2)
                            .map((error, index) => (
                              <li key={index}>
                                <span className="font-medium">
                                  {error.column}:
                                </span>{" "}
                                {error.message}
                              </li>
                            ))}
                          {groupedErrors[rowIndex].length > 2 && (
                            <li className="text-gray-400">
                              +{groupedErrors[rowIndex].length - 2} more errors
                            </li>
                          )}
                        </ul>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => onViewErrors && onViewErrors(rowIndex)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {Object.keys(groupedErrors).length > 5 && (
                <div className="text-center text-sm text-gray-500 my-2">
                  +{Object.keys(groupedErrors).length - 5} more rows with errors
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationSummary;
