import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

// Function to fetch and parse CSV data
async function fetchCSVData() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jmlh_kndrn_brmtr_brdskn_jns_kndrn_d_kt_tskmly-4QBEOLKgcwHboT01ehrH3QsMwC9eXb.csv",
    )
    const csvText = await response.text()

    // Parse CSV
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    })

    return records
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error)
    throw error
  }
}

export async function GET() {
  try {
    // Fetch CSV data
    const records = await fetchCSVData()

    // Extract unique vehicle types
    const vehicleTypes = [...new Set(records.map((record) => record.jenis_kendaraan))]

    return NextResponse.json({ vehicleTypes })
  } catch (error) {
    console.error("Error fetching vehicle types:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil jenis kendaraan" }, { status: 500 })
  }
}
