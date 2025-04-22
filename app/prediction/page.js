"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Table2, Calculator, FileDown } from "lucide-react"
import PredictionChart from "@/components/prediction-chart"
import PredictionTable from "@/components/prediction-table"
import VehicleTypeDistribution from "@/components/vehicle-type-distribution"
import CalculationVisualization from "@/components/calculation-visualization"
import MethodComparison from "@/components/method-comparison"
import { downloadCSV, downloadExcel } from "@/lib/download-utils"

export default function PredictionPage() {
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [selectedVehicleType, setSelectedVehicleType] = useState("")
  const [year, setYear] = useState("2024")
  const [predictionData, setPredictionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showCalculation, setShowCalculation] = useState(false)
  const [activeMethod, setActiveMethod] = useState("comparison")

  // Reference for scrolling to results
  const resultsRef = useRef(null)

  // Fetch available vehicle types on component mount
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await fetch("/api/vehicle-types")
        const data = await response.json()

        // Add "Semua Kendaraan" option
        const allVehicleTypes = ["Semua Kendaraan", ...data.vehicleTypes]

        setVehicleTypes(allVehicleTypes)
        if (allVehicleTypes.length > 0) {
          setSelectedVehicleType(allVehicleTypes[0])
        }
      } catch (error) {
        console.error("Error fetching vehicle types:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchVehicleTypes()
  }, [])

  const handlePredict = async () => {
    if (!selectedVehicleType) return

    setLoading(true)
    setShowCalculation(false)
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleType: selectedVehicleType,
          year: Number.parseInt(year),
        }),
      })

      const data = await response.json()
      setPredictionData(data)
      setShowCalculation(true)

      // Scroll to results after a short delay to ensure rendering is complete
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    } catch (error) {
      console.error("Error predicting data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Modify the handleDownloadCSV function to include more detailed calculations
  const handleDownloadCSV = () => {
    if (!predictionData) return

    // Prepare data for CSV
    const historicalData = predictionData.historicalData || []
    const linearPredictions = predictionData.linearPredictions || []
    const interpolationPredictions = predictionData.interpolationPredictions || []

    // Extract data for Excel-style calculations
    const x = historicalData.map((d) => d.year)
    const y = historicalData.map((d) => Number(d.count))
    const n = x.length
    const meanX = x.reduce((a, b) => a + b, 0) / n
    const meanY = y.reduce((a, b) => a + b, 0) / n

    // Calculate adjusted values (deviations from mean)
    const xDevs = x.map((xi) => xi - meanX)
    const yDevs = y.map((yi) => yi - meanY)

    // Calculate sums of products and squares
    const sumXY = xDevs.reduce((sum, xDev, i) => sum + xDev * yDevs[i], 0)
    const sumXX = xDevs.reduce((sum, xDev) => sum + xDev * xDev, 0)

    // Create headers
    const csvData = [
      ["PREDIKSI JUMLAH KENDARAAN BERMOTOR DI KOTA TASIKMALAYA"],
      [""],
      ["Jenis Kendaraan:", selectedVehicleType],
      ["Tahun Prediksi:", year],
      ["Tanggal Ekspor:", new Date().toLocaleDateString("id-ID")],
      [""],
      ["DATA HISTORIS"],
      ["Tahun", "Jumlah Kendaraan"],
    ]

    // Add historical data
    historicalData.forEach((item) => {
      csvData.push([item.year, item.count])
    })

    // Add prediction results
    csvData.push([""])
    csvData.push(["HASIL PREDIKSI"])
    csvData.push(["Tahun", "Regresi Linier", "Interpolasi Newton", "Selisih", "Persentase Selisih (%)"])

    for (let i = 0; i < linearPredictions.length; i++) {
      const linearValue = Number(linearPredictions[i].count)
      const interpolationValue = Number(interpolationPredictions[i].count)
      const difference = Math.abs(linearValue - interpolationValue)
      const percentDiff = ((difference / linearValue) * 100).toFixed(2)

      csvData.push([linearPredictions[i].year, linearValue, interpolationValue, difference, percentDiff])
    }

    // Add detailed calculation for linear regression (Excel style)
    csvData.push([""])
    csvData.push(["DETAIL PERHITUNGAN REGRESI LINIER (METODE EXCEL)"])
    csvData.push(["1. Tabel Perhitungan"])
    csvData.push(["Tahun (x)", "Jumlah (y)", "x - x̄", "y - ȳ", "(x - x̄)(y - ȳ)", "(x - x̄)²"])

    for (let i = 0; i < x.length; i++) {
      csvData.push([
        x[i],
        y[i],
        (x[i] - meanX).toFixed(2),
        (y[i] - meanY).toFixed(2),
        ((x[i] - meanX) * (y[i] - meanY)).toFixed(2),
        Math.pow(x[i] - meanX, 2).toFixed(2),
      ])
    }

    csvData.push([
      `x̄ = ${meanX.toFixed(2)}`,
      `ȳ = ${meanY.toFixed(2)}`,
      "-",
      "-",
      `Σ = ${sumXY.toFixed(2)}`,
      `Σ = ${sumXX.toFixed(2)}`,
    ])

    csvData.push([""])
    csvData.push(["2. Perhitungan Koefisien Regresi (Rumus Excel)"])
    csvData.push(["Rumus:", "y = mx + b"])
    csvData.push(["Dimana:"])
    csvData.push(["m (slope) = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²"])
    csvData.push([`m = ${sumXY.toFixed(4)} / ${sumXX.toFixed(4)}`])
    csvData.push([`m = ${predictionData.linearRegression.slope.toFixed(4)}`])
    csvData.push([""])
    csvData.push(["b (intercept) = ȳ - m × x̄"])
    csvData.push([
      `b = ${meanY.toFixed(4)} - ${predictionData.linearRegression.slope.toFixed(4)} × ${meanX.toFixed(4)}`,
    ])
    csvData.push([`b = ${predictionData.linearRegression.intercept.toFixed(4)}`])
    csvData.push([""])
    csvData.push([
      "Persamaan Regresi:",
      `y = ${predictionData.linearRegression.slope.toFixed(4)}x + ${predictionData.linearRegression.intercept.toFixed(4)}`,
    ])
    csvData.push(["R-squared:", predictionData.linearRegression.rSquared.toFixed(4)])

    // Add prediction calculation for the target year
    csvData.push([""])
    csvData.push(["3. Perhitungan Prediksi untuk Tahun " + year])
    csvData.push([
      `y = ${predictionData.linearRegression.slope.toFixed(4)} × ${year} + ${predictionData.linearRegression.intercept.toFixed(4)}`,
    ])
    csvData.push([
      `y = ${(predictionData.linearRegression.slope * Number(year)).toFixed(4)} + ${predictionData.linearRegression.intercept.toFixed(4)}`,
    ])
    csvData.push([
      `y = ${(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept).toFixed(4)}`,
    ])
    csvData.push([
      `y = ${Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept)} (dibulatkan)`,
    ])

    // Add Newton interpolation details
    csvData.push([""])
    csvData.push(["DETAIL PERHITUNGAN INTERPOLASI NEWTON"])
    csvData.push(["1. Tabel Perbedaan Terbagi"])

    // Headers for divided differences table
    const ddHeaders = ["x", "f(x)"]
    for (let i = 1; i < x.length; i++) {
      ddHeaders.push(`Δ${i}`)
    }
    csvData.push(ddHeaders)

    // Get divided differences table from the API response
    const ddTable = predictionData.newtonInterpolation.dividedDifferencesTable || []

    // Add each row of the divided differences table
    for (let i = 0; i < ddTable.length; i++) {
      const row = [x[i], y[i]]
      for (let j = 0; j < ddTable[i].length; j++) {
        row.push(ddTable[i][j].toFixed(4))
      }
      csvData.push(row)
    }

    csvData.push([""])
    csvData.push(["2. Koefisien Polinom Newton"])
    const coefficients = predictionData.newtonInterpolation.coefficients || []
    csvData.push(["Koefisien", "Nilai"])
    for (let i = 0; i < coefficients.length; i++) {
      csvData.push([`a${i}`, coefficients[i].toFixed(4)])
    }

    csvData.push([""])
    csvData.push(["3. Rumus Polinom Newton"])
    csvData.push(["P(x) = a₀ + a₁(x-x₀) + a₂(x-x₀)(x-x₁) + ... + aₙ(x-x₀)(x-x₁)...(x-xₙ₋₁)"])

    csvData.push([""])
    csvData.push(["4. Perhitungan Prediksi untuk Tahun " + year])

    // Calculate the prediction for the specific year
    let predictedValue = coefficients[0]
    csvData.push([`P(${year}) = ${coefficients[0].toFixed(4)}`])

    // Calculate each term and track the steps
    for (let j = 1; j < coefficients.length; j++) {
      const factors = []
      let termValue = 1

      for (let i = 0; i < j; i++) {
        factors.push(`(${year} - ${x[i]})`)
        termValue *= Number(year) - x[i]
      }

      const termResult = coefficients[j] * termValue
      predictedValue += termResult

      csvData.push([
        `+ ${coefficients[j].toFixed(4)} × ${factors.join(" × ")} = ${coefficients[j].toFixed(4)} × ${termValue.toFixed(4)} = ${termResult.toFixed(4)}`,
      ])
    }

    csvData.push([`P(${year}) = ${predictedValue.toFixed(4)} ≈ ${Math.round(predictedValue)} (dibulatkan)`])

    csvData.push([""])
    csvData.push(["KESIMPULAN"])
    csvData.push([`Prediksi jumlah kendaraan ${selectedVehicleType} pada tahun ${year} adalah:`])
    csvData.push([
      "Metode Regresi Linier:",
      Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept),
      "unit",
    ])
    csvData.push(["Metode Interpolasi Newton:", Math.round(predictedValue), "unit"])

    const finalDiff = Math.abs(
      Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept) -
        Math.round(predictedValue),
    )

    const finalPercentDiff = (
      (finalDiff /
        Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept)) *
      100
    ).toFixed(2)

    csvData.push(["Selisih:", finalDiff, `unit (${finalPercentDiff}%)`])

    downloadCSV(csvData, `prediksi_${selectedVehicleType.replace(/\s+/g, "_")}_${year}`)
  }

  // Modify the handleDownloadExcel function to match the CSV structure
  const handleDownloadExcel = () => {
    if (!predictionData) return

    // Extract data for Excel-style calculations
    const historicalData = predictionData.historicalData || []
    const linearPredictions = predictionData.linearPredictions || []
    const interpolationPredictions = predictionData.interpolationPredictions || []

    const x = historicalData.map((d) => d.year)
    const y = historicalData.map((d) => Number(d.count))
    const n = x.length
    const meanX = x.reduce((a, b) => a + b, 0) / n
    const meanY = y.reduce((a, b) => a + b, 0) / n

    // Calculate adjusted values (deviations from mean)
    const xDevs = x.map((xi) => xi - meanX)
    const yDevs = y.map((yi) => yi - meanY)

    // Calculate sums of products and squares
    const sumXY = xDevs.reduce((sum, xDev, i) => sum + xDev * yDevs[i], 0)
    const sumXX = xDevs.reduce((sum, xDev) => sum + xDev * xDev, 0)

    // Create headers
    const excelData = [
      ["PREDIKSI JUMLAH KENDARAAN BERMOTOR DI KOTA TASIKMALAYA"],
      [""],
      ["Jenis Kendaraan:", selectedVehicleType],
      ["Tahun Prediksi:", year],
      ["Tanggal Ekspor:", new Date().toLocaleDateString("id-ID")],
      [""],
      ["DATA HISTORIS"],
      ["Tahun", "Jumlah Kendaraan"],
    ]

    // Add historical data
    historicalData.forEach((item) => {
      excelData.push([item.year, Number(item.count)])
    })

    // Add prediction results
    excelData.push([""])
    excelData.push(["HASIL PREDIKSI"])
    excelData.push(["Tahun", "Regresi Linier", "Interpolasi Newton", "Selisih", "Persentase Selisih (%)"])

    for (let i = 0; i < linearPredictions.length; i++) {
      const linearValue = Number(linearPredictions[i].count)
      const interpolationValue = Number(interpolationPredictions[i].count)
      const difference = Math.abs(linearValue - interpolationValue)
      const percentDiff = ((difference / linearValue) * 100).toFixed(2)

      excelData.push([linearPredictions[i].year, linearValue, interpolationValue, difference, percentDiff])
    }

    // Add detailed calculation for linear regression (Excel style)
    excelData.push([""])
    excelData.push(["DETAIL PERHITUNGAN REGRESI LINIER (METODE EXCEL)"])
    excelData.push(["1. Tabel Perhitungan"])
    excelData.push(["Tahun (x)", "Jumlah (y)", "x - x̄", "y - ȳ", "(x - x̄)(y - ȳ)", "(x - x̄)²"])

    for (let i = 0; i < x.length; i++) {
      excelData.push([
        x[i],
        y[i],
        (x[i] - meanX).toFixed(2),
        (y[i] - meanY).toFixed(2),
        ((x[i] - meanX) * (y[i] - meanY)).toFixed(2),
        Math.pow(x[i] - meanX, 2).toFixed(2),
      ])
    }

    excelData.push([
      `x̄ = ${meanX.toFixed(2)}`,
      `ȳ = ${meanY.toFixed(2)}`,
      "-",
      "-",
      `Σ = ${sumXY.toFixed(2)}`,
      `Σ = ${sumXX.toFixed(2)}`,
    ])

    excelData.push([""])
    excelData.push(["2. Perhitungan Koefisien Regresi (Rumus Excel)"])
    excelData.push(["Rumus:", "y = mx + b"])
    excelData.push(["Dimana:"])
    excelData.push(["m (slope) = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²"])
    excelData.push([`m = ${sumXY.toFixed(4)} / ${sumXX.toFixed(4)}`])
    excelData.push([`m = ${predictionData.linearRegression.slope.toFixed(4)}`])
    excelData.push([""])
    excelData.push(["b (intercept) = ȳ - m × x̄"])
    excelData.push([
      `b = ${meanY.toFixed(4)} - ${predictionData.linearRegression.slope.toFixed(4)} × ${meanX.toFixed(4)}`,
    ])
    excelData.push([`b = ${predictionData.linearRegression.intercept.toFixed(4)}`])
    excelData.push([""])
    excelData.push([
      "Persamaan Regresi:",
      `y = ${predictionData.linearRegression.slope.toFixed(4)}x + ${predictionData.linearRegression.intercept.toFixed(4)}`,
    ])
    excelData.push(["R-squared:", predictionData.linearRegression.rSquared.toFixed(4)])

    // Add prediction calculation for the target year
    excelData.push([""])
    excelData.push(["3. Perhitungan Prediksi untuk Tahun " + year])
    excelData.push([
      `y = ${predictionData.linearRegression.slope.toFixed(4)} × ${year} + ${predictionData.linearRegression.intercept.toFixed(4)}`,
    ])
    excelData.push([
      `y = ${(predictionData.linearRegression.slope * Number(year)).toFixed(4)} + ${predictionData.linearRegression.intercept.toFixed(4)}`,
    ])
    excelData.push([
      `y = ${(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept).toFixed(4)}`,
    ])
    excelData.push([
      `y = ${Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept)} (dibulatkan)`,
    ])

    // Add Newton interpolation details
    excelData.push([""])
    excelData.push(["DETAIL PERHITUNGAN INTERPOLASI NEWTON"])
    excelData.push(["1. Tabel Perbedaan Terbagi"])

    // Headers for divided differences table
    const ddHeaders = ["x", "f(x)"]
    for (let i = 1; i < x.length; i++) {
      ddHeaders.push(`Δ${i}`)
    }
    excelData.push(ddHeaders)

    // Get divided differences table from the API response
    const ddTable = predictionData.newtonInterpolation.dividedDifferencesTable || []

    // Add each row of the divided differences table
    for (let i = 0; i < ddTable.length; i++) {
      const row = [x[i], y[i]]
      for (let j = 0; j < ddTable[i].length; j++) {
        row.push(ddTable[i][j].toFixed(4))
      }
      excelData.push(row)
    }

    excelData.push([""])
    excelData.push(["2. Koefisien Polinom Newton"])
    const coefficients = predictionData.newtonInterpolation.coefficients || []
    excelData.push(["Koefisien", "Nilai"])
    for (let i = 0; i < coefficients.length; i++) {
      excelData.push([`a${i}`, coefficients[i].toFixed(4)])
    }

    excelData.push([""])
    excelData.push(["3. Rumus Polinom Newton"])
    excelData.push(["P(x) = a₀ + a₁(x-x₀) + a₂(x-x₀)(x-x₁) + ... + aₙ(x-x₀)(x-x₁)...(x-xₙ₋₁)"])

    excelData.push([""])
    excelData.push(["4. Perhitungan Prediksi untuk Tahun " + year])

    // Calculate the prediction for the specific year
    let predictedValue = coefficients[0]
    excelData.push([`P(${year}) = ${coefficients[0].toFixed(4)}`])

    // Calculate each term and track the steps
    for (let j = 1; j < coefficients.length; j++) {
      const factors = []
      let termValue = 1

      for (let i = 0; i < j; i++) {
        factors.push(`(${year} - ${x[i]})`)
        termValue *= Number(year) - x[i]
      }

      const termResult = coefficients[j] * termValue
      predictedValue += termResult

      excelData.push([
        `+ ${coefficients[j].toFixed(4)} × ${factors.join(" × ")} = ${coefficients[j].toFixed(4)} × ${termValue.toFixed(4)} = ${termResult.toFixed(4)}`,
      ])
    }

    excelData.push([`P(${year}) = ${predictedValue.toFixed(4)} ≈ ${Math.round(predictedValue)} (dibulatkan)`])

    excelData.push([""])
    excelData.push(["KESIMPULAN"])
    excelData.push([`Prediksi jumlah kendaraan ${selectedVehicleType} pada tahun ${year} adalah:`])
    excelData.push([
      "Metode Regresi Linier:",
      Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept),
      "unit",
    ])
    excelData.push(["Metode Interpolasi Newton:", Math.round(predictedValue), "unit"])

    const finalDiff = Math.abs(
      Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept) -
        Math.round(predictedValue),
    )

    const finalPercentDiff = (
      (finalDiff /
        Math.round(predictionData.linearRegression.slope * Number(year) + predictionData.linearRegression.intercept)) *
      100
    ).toFixed(2)

    excelData.push(["Selisih:", finalDiff, `unit (${finalPercentDiff}%)`])

    downloadExcel(excelData, `prediksi_${selectedVehicleType.replace(/\s+/g, "_")}_${year}`)
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-heading">Prediksi Jumlah Kendaraan</h1>
          <p className="text-muted-foreground">
            Prediksi jumlah kendaraan bermotor di Kota Tasikmalaya menggunakan metode Regresi Linier dan Interpolasi
            Polinom Newton.
          </p>
        </div>

        <Card className="p-6 shadow-md mb-8">
          {initialLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Jenis Kendaraan</label>
                  <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tahun Prediksi</label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun prediksi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handlePredict}
                    className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Prediksi Jumlah Kendaraan"}
                  </Button>
                </div>
              </div>

              <VehicleTypeDistribution />

              {predictionData && (
                <div className="mt-8" ref={resultsRef}>
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-xl font-semibold">Hasil Prediksi</h2>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => setShowCalculation(!showCalculation)}
                      >
                        <Calculator className="h-4 w-4" />
                        {showCalculation ? "Sembunyikan Perhitungan" : "Lihat Perhitungan"}
                      </Button>
                      <Button variant="outline" className="flex items-center gap-1" onClick={handleDownloadCSV}>
                        <FileDown className="h-4 w-4" />
                        CSV
                      </Button>
                      <Button variant="outline" className="flex items-center gap-1" onClick={handleDownloadExcel}>
                        <FileDown className="h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </div>

                  {showCalculation && (
                    <div className="mb-6">
                      <Tabs value={activeMethod} onValueChange={setActiveMethod}>
                        <TabsList className="mb-4 flex flex-wrap">
                          <TabsTrigger value="comparison">Perbandingan Metode</TabsTrigger>
                          <TabsTrigger value="linear">Regresi Linier</TabsTrigger>
                          <TabsTrigger value="interpolation">Interpolasi Newton</TabsTrigger>
                        </TabsList>

                        <TabsContent value="comparison">
                          <MethodComparison data={predictionData} />
                        </TabsContent>

                        <TabsContent value="linear">
                          <CalculationVisualization data={predictionData} method="linear" year={year} />
                        </TabsContent>

                        <TabsContent value="interpolation">
                          <CalculationVisualization data={predictionData} method="interpolation" year={year} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  <Tabs defaultValue="chart">
                    <TabsList className="flex flex-wrap">
                      <TabsTrigger value="chart" className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Grafik
                      </TabsTrigger>
                      <TabsTrigger value="table" className="flex items-center gap-1">
                        <Table2 className="h-4 w-4" />
                        Tabel
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart">
                      <PredictionChart data={predictionData} />
                    </TabsContent>

                    <TabsContent value="table">
                      <PredictionTable data={predictionData} />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
