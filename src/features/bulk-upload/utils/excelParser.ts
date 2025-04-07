import * as XLSX from "xlsx";

export interface ParsedExcel {
  columns: string[];
  data: Record<string, unknown>[];
}

/**
 * Parse Excel file and convert to a standardized format
 */
export const parseExcelFile = (file: File): Promise<ParsedExcel> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          blankrows: false,
        });

        if (jsonData.length === 0) {
          throw new Error("Excel file is empty");
        }

        // Extract headers (first row)
        const headers = jsonData[0] as string[];

        // Clean up headers (remove whitespace, duplicates)
        const cleanHeaders = headers.map((header) => header.toString().trim());

        // Convert data rows to objects with headers as keys
        const rows = jsonData.slice(1).map((row: any) => {
          const dataRow: Record<string, unknown> = {};

          cleanHeaders.forEach((header, index) => {
            // Skip empty headers
            if (header) {
              dataRow[header] = row[index] !== undefined ? row[index] : null;
            }
          });

          return dataRow;
        });

        resolve({
          columns: cleanHeaders,
          data: rows,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};
