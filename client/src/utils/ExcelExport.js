// utils/excelExport.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportTableToExcel(tableId, fileName) {
  const table = document.getElementById(tableId);

  if (!table) {
    console.error(`Table with id "${tableId}" not found`);
    return;
  }

  // Convert table (including headers) to worksheet
  const worksheet = XLSX.utils.table_to_sheet(table);

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write workbook to binary array
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Save file
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `${fileName}.xlsx`);
}