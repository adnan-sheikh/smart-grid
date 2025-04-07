import React, { useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { ValidationError } from "../types";

interface DataGridProps {
  data: Record<string, unknown>[];
  columns: string[];
  errors?: ValidationError[];
  className?: string;
  pageSize?: number;
  focusedRowIndex?: number | null;
}

const DataGrid: React.FC<DataGridProps> = ({
  data,
  columns,
  errors = [],
  className,
  pageSize = 10,
  focusedRowIndex = null,
}) => {
  // Create a lookup for errors by row
  const errorsByRow = useMemo(() => {
    const lookup: Record<number, Record<string, string[]>> = {};

    errors.forEach((error) => {
      const rowIndex = error.row - 1; // Convert from 1-based to 0-based

      if (!lookup[rowIndex]) {
        lookup[rowIndex] = {};
      }

      if (!lookup[rowIndex][error.column]) {
        lookup[rowIndex][error.column] = [];
      }

      lookup[rowIndex][error.column].push(error.message);
    });

    return lookup;
  }, [errors]);

  // Generate table columns with explicit IDs
  const tableColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      columns.map((column) => ({
        id: column, // Ensure ID is set
        header: column,
        accessorKey: column,
        cell: ({ row, getValue }) => {
          const value = getValue() as string | number | boolean | null;
          const rowIndex = row.index;
          const hasError = errorsByRow[rowIndex]?.[column];

          return (
            <div className={`${hasError ? "relative group" : ""}`}>
              <div className={`${hasError ? "text-red-600" : ""}`}>
                {value === null ? "" : String(value)}
              </div>

              {hasError && (
                <div className="hidden group-hover:block absolute z-10 bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded shadow-lg bottom-full left-0 min-w-max">
                  <ul className="list-disc pl-4">
                    {errorsByRow[rowIndex][column].map((message, i) => (
                      <li key={i}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        },
      })),
    [columns, errorsByRow]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Effect to focus on a specific row by setting the current page accordingly
  useEffect(() => {
    if (focusedRowIndex !== null && table) {
      const pageIndex = Math.floor(focusedRowIndex / pageSize);
      table.setPageIndex(pageIndex);
    }
  }, [focusedRowIndex, pageSize, table]);

  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">No data to display</div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => {
              const hasErrors = errorsByRow[row.index];

              return (
                <tr
                  key={row.id}
                  className={`${
                    hasErrors
                      ? "bg-red-50 hover:bg-red-100"
                      : row.index % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100"
                  } ${
                    focusedRowIndex === row.index
                      ? "ring-2 ring-blue-500 ring-inset"
                      : ""
                  }`}
                  ref={
                    focusedRowIndex === row.index
                      ? (el) =>
                          el?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          })
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {table.getState().pagination.pageIndex * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * pageSize,
                  data.length
                )}
              </span>{" "}
              of <span className="font-medium">{data.length}</span> results
            </p>
          </div>
          <div>
            <nav
              className="inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                {table.getState().pagination.pageIndex + 1} /{" "}
                {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
