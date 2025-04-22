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

// Function to perform linear regression using Excel's approach
function excelLinearRegression(x, y) {
  const n = x.length

  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n
  const yMean = y.reduce((sum, val) => sum + val, 0) / n

  // Calculate sums for the formulas (similar to Excel's LINEST)
  let sumXY = 0
  let sumXX = 0
  let sumYY = 0

  for (let i = 0; i < n; i++) {
    // Adjusted x and y values (deviations from mean)
    const xDev = x[i] - xMean
    const yDev = y[i] - yMean

    sumXY += xDev * yDev
    sumXX += xDev * xDev
    sumYY += yDev * yDev
  }

  // Calculate slope (equivalent to Excel's SLOPE function)
  const slope = sumXY / sumXX

  // Calculate intercept (equivalent to Excel's INTERCEPT function)
  const intercept = yMean - slope * xMean

  // Calculate R-squared (coefficient of determination)
  // This is equivalent to Excel's RSQ function
  const rSquared = Math.pow(sumXY / Math.sqrt(sumXX * sumYY), 2)

  return { slope, intercept, rSquared }
}

// Function to calculate predictions using linear regression
function calculateLinearPredictions(x, y, predictYears) {
  const { slope, intercept, rSquared } = excelLinearRegression(x, y)

  const predictions = predictYears.map((year) => ({
    year,
    count: Math.round(slope * year + intercept).toString(),
  }))

  return { predictions, slope, intercept, rSquared }
}

// Function to calculate divided differences for Newton's interpolation
// This follows the approach used in numerical analysis, similar to Excel's interpolation
function calculateDividedDifferences(x, y) {
  const n = x.length
  const dividedDifferences = Array(n)
    .fill()
    .map(() => Array(n - 1).fill(0))

  // First-order divided differences
  for (let i = 0; i < n - 1; i++) {
    dividedDifferences[i][0] = (y[i + 1] - y[i]) / (x[i + 1] - x[i])
  }

  // Higher-order divided differences
  for (let j = 1; j < n - 1; j++) {
    for (let i = 0; i < n - j - 1; i++) {
      dividedDifferences[i][j] =
        (dividedDifferences[i + 1][j - 1] - dividedDifferences[i][j - 1]) / (x[i + j + 1] - x[i])
    }
  }

  return dividedDifferences
}

// Function to calculate Newton's interpolation coefficients
function calculateNewtonCoefficients(x, y, dividedDifferences) {
  const n = x.length
  const coefficients = Array(n).fill(0)

  coefficients[0] = y[0]

  for (let i = 1; i < n; i++) {
    coefficients[i] = dividedDifferences[0][i - 1]
  }

  return coefficients
}

// Function to evaluate Newton's polynomial at a given point
function evaluateNewtonPolynomial(coefficients, x, points) {
  return (xi) => {
    let result = coefficients[0]
    let term = 1

    for (let i = 1; i < coefficients.length; i++) {
      term *= xi - points[i - 1]
      result += coefficients[i] * term
    }

    return result
  }
}

// Function to calculate predictions using Newton's interpolation
function calculateNewtonPredictions(x, y, predictYears) {
  const dividedDifferences = calculateDividedDifferences(x, y)
  const coefficients = calculateNewtonCoefficients(x, y, dividedDifferences)
  const polynomialFunction = evaluateNewtonPolynomial(coefficients, x, x)

  const predictions = predictYears.map((year) => ({
    year,
    count: Math.round(polynomialFunction(year)).toString(),
  }))

  return { predictions, coefficients, dividedDifferencesTable: dividedDifferences }
}

// Function to aggregate data for all vehicle types
function aggregateAllVehicleTypes(records) {
  // Group by year
  const yearGroups = {}

  records.forEach((record) => {
    const year = record.tahun
    const count = Number.parseInt(record.jumlah_kendaraan)

    if (!yearGroups[year]) {
      yearGroups[year] = 0
    }

    yearGroups[year] += count
  })

  // Convert to array format
  const aggregatedData = Object.entries(yearGroups)
    .map(([year, count]) => ({
      year: Number.parseInt(year),
      count: count.toString(),
    }))
    .sort((a, b) => a.year - b.year)

  return aggregatedData
}

export async function POST(request) {
  try {
    const { vehicleType, year } = await request.json()

    if (!vehicleType || !year) {
      return NextResponse.json({ error: "Jenis kendaraan dan tahun harus diisi" }, { status: 400 })
    }

    // Fetch CSV data
    const records = await fetchCSVData()

    let historicalData = []

    // Handle "Semua Kendaraan" special case
    if (vehicleType === "Semua Kendaraan") {
      historicalData = aggregateAllVehicleTypes(records)
    } else {
      // Filter data for the selected vehicle type
      const filteredData = records.filter((record) => record.jenis_kendaraan === vehicleType)

      if (filteredData.length === 0) {
        return NextResponse.json({ error: "Data tidak ditemukan untuk jenis kendaraan yang dipilih" }, { status: 404 })
      }

      // Extract historical data (2019-2023)
      historicalData = filteredData
        .map((record) => ({
          year: Number.parseInt(record.tahun),
          count: record.jumlah_kendaraan,
        }))
        .sort((a, b) => a.year - b.year)
    }

    // Prepare data for calculations
    const x = historicalData.map((d) => d.year)
    const y = historicalData.map((d) => Number.parseInt(d.count))

    // Years to predict
    const predictYears = Array.from({ length: 5 }, (_, i) => 2024 + i)

    // 1. Linear Regression (Excel approach)
    const linearResult = calculateLinearPredictions(x, y, predictYears)

    // 2. Newton's Interpolation
    const newtonResult = calculateNewtonPredictions(x, y, predictYears)

    // Filter predictions based on requested year
    const filteredLinearPredictions = linearResult.predictions.filter((p) => p.year >= year)
    const filteredInterpolationPredictions = newtonResult.predictions.filter((p) => p.year >= year)

    // Calculate Excel's FORECAST values for comparison
    // FORECAST in Excel: FORECAST(x, known_y's, known_x's)
    const forecastPredictions = predictYears
      .map((predictYear) => {
        // This is equivalent to Excel's FORECAST function
        const numerator = y.reduce(
          (sum, yi, i) =>
            sum + (x[i] - x.reduce((s, v) => s + v, 0) / x.length) * (yi - y.reduce((s, v) => s + v, 0) / y.length),
          0,
        )
        const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - x.reduce((s, v) => s + v, 0) / x.length, 2), 0)
        const slope = numerator / denominator
        const intercept = y.reduce((s, v) => s + v, 0) / y.length - slope * (x.reduce((s, v) => s + v, 0) / x.length)

        return {
          year: predictYear,
          count: Math.round(slope * predictYear + intercept).toString(),
        }
      })
      .filter((p) => p.year >= year)

    return NextResponse.json({
      vehicleType,
      year,
      historicalData,
      linearPredictions: filteredLinearPredictions,
      interpolationPredictions: filteredInterpolationPredictions,
      forecastPredictions: forecastPredictions,
      linearRegression: {
        slope: linearResult.slope,
        intercept: linearResult.intercept,
        rSquared: linearResult.rSquared,
      },
      newtonInterpolation: {
        coefficients: newtonResult.coefficients,
        dividedDifferencesTable: newtonResult.dividedDifferencesTable,
      },
    })
  } catch (error) {
    console.error("Error processing prediction:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat memproses prediksi" }, { status: 500 })
  }
}
