/**
 * Download data as CSV file
 * @param {Array} data - Array of arrays containing data rows
 * @param {string} filename - Name of the file without extension
 */
export function downloadCSV(data, filename) {
  // Convert data to CSV format
  const csvContent = data.map((row) => row.join(",")).join("\n")

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Create a download link
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  // Set link properties
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"

  // Add link to document, click it, and remove it
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download data as Excel file
 * @param {Array} data - Array of arrays containing data rows
 * @param {string} filename - Name of the file without extension
 */
export function downloadExcel(data, filename) {
  try {
    // Dynamically import XLSX
    import("xlsx")
      .then((XLSX) => {
        // Create a workbook with a worksheet
        const ws = XLSX.utils.aoa_to_sheet(data)
        const wb = XLSX.utils.book_new()

        // Add borders and styling to the worksheet
        if (!ws["!cols"]) ws["!cols"] = []
        if (!ws["!rows"]) ws["!rows"] = []

        // Set column widths
        for (let i = 0; i < 10; i++) {
          ws["!cols"][i] = { width: 15 }
        }

        // Apply borders to all cells
        const range = XLSX.utils.decode_range(ws["!ref"])
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R }
            const cell_ref = XLSX.utils.encode_cell(cell_address)
            if (!ws[cell_ref]) continue

            if (!ws[cell_ref].s) ws[cell_ref].s = {}
            ws[cell_ref].s.border = {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            }

            // Add background color to header rows
            if (
              R === 0 ||
              data[R][0] === "" ||
              data[R][0].includes("DATA") ||
              data[R][0].includes("HASIL") ||
              data[R][0].includes("DETAIL") ||
              data[R][0].includes("PERHITUNGAN") ||
              data[R][0].includes("TABEL")
            ) {
              ws[cell_ref].s.fill = {
                patternType: "solid",
                fgColor: { rgb: "EEEEEE" },
              }
              ws[cell_ref].s.font = {
                bold: true,
              }
            }
          }
        }

        XLSX.utils.book_append_sheet(wb, ws, "Prediksi")

        // Generate Excel file
        XLSX.writeFile(wb, `${filename}.xlsx`)
      })
      .catch((error) => {
        console.error("Error loading XLSX library:", error)
        alert("Gagal mengunduh file Excel. Silakan coba lagi.")
      })
  } catch (error) {
    console.error("Error downloading Excel:", error)
    alert("Gagal mengunduh file Excel. Silakan coba lagi.")
  }
}
