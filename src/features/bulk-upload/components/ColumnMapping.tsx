import React, { useEffect } from "react";
import { ColumnMap } from "../types";

interface ColumnMappingProps {
  sourceColumns: string[];
  columnMapping: ColumnMap[];
  onMappingChange: (mapping: ColumnMap[]) => void;
  className?: string;
}

const validationTypes = [
  { value: "string", label: "Text" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "integer", label: "Integer" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "phone", label: "Phone" },
];

const ColumnMapping: React.FC<ColumnMappingProps> = ({
  sourceColumns,
  columnMapping,
  onMappingChange,
  className,
}) => {
  // If we have source columns but no column mapping yet, auto-generate initial mapping
  useEffect(() => {
    if (sourceColumns.length > 0 && columnMapping.length === 0) {
      const initialMapping = sourceColumns.map((column) => ({
        sourceColumn: column,
        targetColumn: column,
        required: false,
        validationType: "string",
      }));
      onMappingChange(initialMapping);
    }
  }, [sourceColumns, columnMapping.length, onMappingChange]);

  const handleColumnChange = (
    index: number,
    field: keyof ColumnMap,
    value: string | boolean
  ) => {
    const updatedMapping = [...columnMapping];
    updatedMapping[index] = {
      ...updatedMapping[index],
      [field]: value,
    };

    // If source column changes, suggest the same for target column if target is empty
    if (field === "sourceColumn" && !updatedMapping[index].targetColumn) {
      updatedMapping[index].targetColumn = value as string;
    }

    onMappingChange(updatedMapping);
  };

  const handleRemoveColumn = (index: number) => {
    const updatedMapping = columnMapping.filter((_, i) => i !== index);
    onMappingChange(updatedMapping);
  };

  const handleAddColumn = () => {
    onMappingChange([
      ...columnMapping,
      {
        sourceColumn: "",
        targetColumn: "",
        required: false,
        validationType: "string",
      },
    ]);
  };

  // Auto-detect validation type based on sample data (this would be improved with real AI)
  const suggestValidationType = (index: number) => {
    // This is a simple example - in a real application, you would analyze sample data
    // from the Excel file to make intelligent suggestions
    const mapping = columnMapping[index];
    const columnName = mapping.sourceColumn.toLowerCase();

    if (columnName.includes("email")) {
      handleColumnChange(index, "validationType", "email");
    } else if (columnName.includes("date") || columnName.includes("time")) {
      handleColumnChange(index, "validationType", "date");
    } else if (columnName.includes("phone") || columnName.includes("mobile")) {
      handleColumnChange(index, "validationType", "phone");
    } else if (
      columnName.includes("url") ||
      columnName.includes("website") ||
      columnName.includes("link")
    ) {
      handleColumnChange(index, "validationType", "url");
    } else if (
      columnName.includes("number") ||
      columnName.includes("amount") ||
      columnName.includes("price")
    ) {
      handleColumnChange(index, "validationType", "number");
    }
  };

  // Allow batch update of required fields
  const handleMarkAllRequired = () => {
    const updatedMapping = columnMapping.map((mapping) => ({
      ...mapping,
      required: true,
    }));
    onMappingChange(updatedMapping);
  };

  // Allow batch clearing of required fields
  const handleClearAllRequired = () => {
    const updatedMapping = columnMapping.map((mapping) => ({
      ...mapping,
      required: false,
    }));
    onMappingChange(updatedMapping);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Column Mapping</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleMarkAllRequired}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Mark All Required
          </button>
          <button
            type="button"
            onClick={handleClearAllRequired}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Required
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Source Column
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Target Field
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Data Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Required
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {columnMapping.map((mapping, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={mapping.sourceColumn}
                    onChange={(e) => {
                      handleColumnChange(index, "sourceColumn", e.target.value);
                      // Trigger validation type suggestion after source column change
                      setTimeout(() => suggestValidationType(index), 0);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    data-testid={`source-column-${index}`}
                  >
                    <option value="">-- Select Source Column --</option>
                    {sourceColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={mapping.targetColumn}
                    onChange={(e) =>
                      handleColumnChange(index, "targetColumn", e.target.value)
                    }
                    placeholder="Target Field Name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    data-testid={`target-field-${index}`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={mapping.validationType}
                    onChange={(e) =>
                      handleColumnChange(
                        index,
                        "validationType",
                        e.target.value
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    data-testid={`data-type-${index}`}
                  >
                    {validationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={mapping.required}
                    onChange={(e) =>
                      handleColumnChange(index, "required", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    data-testid={`required-${index}`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => suggestValidationType(index)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Suggest data type based on column name"
                      data-testid={`suggest-type-${index}`}
                    >
                      Suggest Type
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(index)}
                      className="text-red-600 hover:text-red-900"
                      data-testid={`remove-column-${index}`}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {columnMapping.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No columns mapped yet. Add a column mapping or upload a file
                  to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddColumn}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          data-testid="add-column-button"
        >
          Add Column
        </button>
      </div>
    </div>
  );
};

export default ColumnMapping;
