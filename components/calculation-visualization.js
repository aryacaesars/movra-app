"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"

export default function CalculationVisualization({ data, method, year }) {
  if (!data || !data.historicalData) {
    return <div>Tidak ada data perhitungan untuk ditampilkan</div>
  }

  // Extract historical data
  const historicalData = data.historicalData || []

  // Format angka dengan pemisah ribuan
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(Number(num))
  }

  // Prepare data for visualization
  const x = historicalData.map((d) => d.year)
  const y = historicalData.map((d) => Number(d.count))
  const n = x.length

  // Prepare data for scatter plot
  const scatterData = historicalData.map((d) => ({
    year: d.year,
    value: Number(d.count),
  }))

  if (method === "linear") {
    // Calculate sums for linear regression (Excel approach)
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const meanX = sumX / n
    const meanY = sumY / n

    // Calculate adjusted values (deviations from mean)
    const xDevs = x.map((xi) => xi - meanX)
    const yDevs = y.map((yi) => yi - meanY)

    // Calculate sums of products and squares
    const sumXY = xDevs.reduce((sum, xDev, i) => sum + xDev * yDevs[i], 0)
    const sumXX = xDevs.reduce((sum, xDev) => sum + xDev * xDev, 0)
    const sumYY = yDevs.reduce((sum, yDev) => sum + yDev * yDev, 0)

    // Get slope and intercept from the data (Excel approach)
    const slope = sumXY / sumXX
    const intercept = meanY - slope * meanX
    const rSquared = Math.pow(sumXY / Math.sqrt(sumXX * sumYY), 2)

    // Generate regression line data for chart
    const regressionLineData = []
    const minYear = Math.min(...x)
    const maxYear = Math.max(...data.linearPredictions.map((p) => p.year))

    for (let yearPoint = minYear; yearPoint <= maxYear; yearPoint++) {
      regressionLineData.push({
        year: yearPoint,
        value: Math.round(slope * yearPoint + intercept),
      })
    }

    // Prepare prediction points
    const predictionPoints = data.linearPredictions.map((d) => ({
      year: d.year,
      value: Number(d.count),
    }))

    // Calculate the prediction for the specific year
    const targetYear = Number(year)
    const predictedValue = slope * targetYear + intercept
    const roundedPrediction = Math.round(predictedValue)

    return (
      <Card className="calculation-section">
        <h3 className="text-xl font-bold mb-4 text-brand">Perhitungan Regresi Linier (Metode Excel)</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Data Input</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tahun (x)</TableHead>
                    <TableHead>Jumlah (y)</TableHead>
                    <TableHead>x - x̄</TableHead>
                    <TableHead>y - ȳ</TableHead>
                    <TableHead>(x - x̄)(y - ȳ)</TableHead>
                    <TableHead>(x - x̄)²</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{formatNumber(item.count)}</TableCell>
                      <TableCell>{(item.year - meanX).toFixed(2)}</TableCell>
                      <TableCell>{(Number(item.count) - meanY).toFixed(2)}</TableCell>
                      <TableCell>{((item.year - meanX) * (Number(item.count) - meanY)).toFixed(2)}</TableCell>
                      <TableCell>{Math.pow(item.year - meanX, 2).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-medium">
                    <TableCell>x̄ = {meanX.toFixed(2)}</TableCell>
                    <TableCell>ȳ = {meanY.toFixed(2)}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>Σ = {sumXY.toFixed(2)}</TableCell>
                    <TableCell>Σ = {sumXX.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Langkah-langkah Perhitungan (Rumus Excel)</h4>
            <div className="formula-box mb-4">
              <p className="mb-2">
                <strong>1. Rumus Regresi Linier:</strong> y = mx + b
              </p>
              <p className="mb-2">
                <strong>2. Mencari nilai m (slope) dengan rumus SLOPE Excel:</strong>
              </p>
              <p className="font-mono text-sm mb-2">m = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)²</p>
              <p className="font-mono text-sm mb-2">
                m = {sumXY.toFixed(4)} / {sumXX.toFixed(4)}
              </p>
              <p className="font-mono text-sm mb-3">m = {slope.toFixed(4)}</p>

              <p className="mb-2">
                <strong>3. Mencari nilai b (intercept) dengan rumus INTERCEPT Excel:</strong>
              </p>
              <p className="font-mono text-sm mb-2">b = ȳ - m × x̄</p>
              <p className="font-mono text-sm mb-2">
                b = {meanY.toFixed(4)} - {slope.toFixed(4)} × {meanX.toFixed(4)}
              </p>
              <p className="font-mono text-sm mb-3">b = {intercept.toFixed(4)}</p>

              <p className="mb-2">
                <strong>4. Persamaan Regresi:</strong> y = {slope.toFixed(4)}x + {intercept.toFixed(4)}
              </p>
              <p className="mb-2">
                <strong>5. Koefisien determinasi (R²):</strong> {rSquared.toFixed(4)}
              </p>
            </div>

            <div className="formula-box">
              <h4 className="font-medium mb-2">Prediksi untuk Tahun {targetYear} (Rumus FORECAST Excel)</h4>
              <p className="mb-1">
                <strong>1. Substitusi x = {targetYear} ke persamaan regresi:</strong>
              </p>
              <p className="font-mono text-sm mb-1">
                y = {slope.toFixed(4)} × {targetYear} + {intercept.toFixed(4)}
              </p>
              <p className="font-mono text-sm mb-1">
                y = {(slope * targetYear).toFixed(4)} + {intercept.toFixed(4)}
              </p>
              <p className="font-mono text-sm mb-1">y = {predictedValue.toFixed(4)}</p>
              <p className="font-mono text-sm font-medium">y = {roundedPrediction} (dibulatkan)</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Visualisasi Regresi Linier</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={["dataMin - 1", "dataMax + 1"]}
                  label={{ value: "Tahun", position: "bottom", offset: 0 }}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  label={{ value: "Jumlah Kendaraan", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value) => [formatNumber(value), "Jumlah Kendaraan"]}
                  labelFormatter={(label) => `Tahun ${label}`}
                />
                <Scatter name="Data Historis" data={scatterData} fill="hsl(var(--chart-3))" />
                <Scatter name="Prediksi" data={predictionPoints} fill="hsl(var(--chart-1))" />
                <Line
                  name="Garis Regresi"
                  data={regressionLineData}
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  dot={false}
                  activeDot={false}
                  strokeWidth={2}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 p-3 bg-secondary rounded-lg">
          <p className="text-sm">
            <strong>Interpretasi:</strong> Garis regresi menunjukkan tren linier dari data historis. Semakin tinggi
            nilai R², semakin baik model regresi dalam menjelaskan variasi data. Untuk tahun {targetYear}, prediksi
            jumlah kendaraan adalah {formatNumber(roundedPrediction)} unit.
          </p>
        </div>
      </Card>
    )
  } else if (method === "interpolation") {
    // Get Newton interpolation data
    const coefficients = data.newtonInterpolation?.coefficients || []
    const dividedDifferencesTable = data.newtonInterpolation?.dividedDifferencesTable || []

    // Prepare prediction points
    const predictionPoints = data.interpolationPredictions.map((d) => ({
      year: d.year,
      value: Number(d.count),
    }))

    // Generate interpolation curve data
    const interpolationCurveData = []
    const minYear = Math.min(...x)
    const maxYear = Math.max(...data.interpolationPredictions.map((p) => p.year))

    // Calculate points for the curve (more points for smoother curve)
    for (let yearPoint = minYear; yearPoint <= maxYear; yearPoint += 0.1) {
      let result = coefficients[0]
      let term = 1

      for (let j = 1; j < coefficients.length; j++) {
        term *= yearPoint - x[j - 1]
        result += coefficients[j] * term
      }

      interpolationCurveData.push({
        year: yearPoint,
        value: result,
      })
    }

    // Calculate the prediction for the specific year
    const targetYear = Number(year)
    let predictedValue = coefficients[0]
    const calculationSteps = []

    // First step is just the first coefficient
    calculationSteps.push({
      step: 1,
      term: `a₀ = ${coefficients[0].toFixed(4)}`,
      value: coefficients[0].toFixed(4),
      running: coefficients[0].toFixed(4),
    })

    // Calculate each term and track the steps
    for (let j = 1; j < coefficients.length; j++) {
      const factors = []
      let termValue = 1

      for (let i = 0; i < j; i++) {
        factors.push(`(${targetYear} - ${x[i]})`)
        termValue *= targetYear - x[i]
      }

      const termResult = coefficients[j] * termValue
      predictedValue += termResult

      calculationSteps.push({
        step: j + 1,
        term: `a${j} × ${factors.join(" × ")}`,
        calculation: `${coefficients[j].toFixed(4)} × ${termValue.toFixed(4)}`,
        value: termResult.toFixed(4),
        running: predictedValue.toFixed(4),
      })
    }

    const roundedPrediction = Math.round(predictedValue)

    return (
      <Card className="calculation-section">
        <h3 className="text-xl font-bold mb-4 text-brand">Perhitungan Interpolasi Polinom Newton</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Tabel Perbedaan Terbagi</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>x</TableHead>
                    <TableHead>f(x)</TableHead>
                    {dividedDifferencesTable[0]?.map((_, index) => (
                      <TableHead key={index}>Δ{index + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{formatNumber(item.count)}</TableCell>
                      {dividedDifferencesTable[i]?.map((diff, j) => (
                        <TableCell key={j}>{diff.toFixed(4)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Langkah-langkah Perhitungan Perbedaan Terbagi</h4>
              <div className="formula-box">
                <p className="mb-2">
                  <strong>1. Perbedaan Terbagi Pertama (Δ₁):</strong>
                </p>
                <p className="font-mono text-sm mb-2">Δ₁(x₁, x₂) = [f(x₂) - f(x₁)] / (x₂ - x₁)</p>
                {x.length > 1 && (
                  <p className="font-mono text-sm mb-3">
                    Contoh: Δ₁({x[0]}, {x[1]}) = [{y[1]} - {y[0]}] / ({x[1]} - {x[0]}) ={" "}
                    {dividedDifferencesTable[0][0].toFixed(4)}
                  </p>
                )}

                <p className="mb-2">
                  <strong>2. Perbedaan Terbagi Kedua (Δ₂):</strong>
                </p>
                <p className="font-mono text-sm mb-2">Δ₂(x₁, x₂, x₃) = [Δ₁(x₂, x₃) - Δ₁(x₁, x₂)] / (x₃ - x₁)</p>
                {x.length > 2 && (
                  <p className="font-mono text-sm mb-3">
                    Contoh: Δ₂({x[0]}, {x[1]}, {x[2]}) = [{dividedDifferencesTable[1][0].toFixed(4)} -{" "}
                    {dividedDifferencesTable[0][0].toFixed(4)}] / ({x[2]} - {x[0]}) ={" "}
                    {dividedDifferencesTable[0][1].toFixed(4)}
                  </p>
                )}

                <p className="mb-2">
                  <strong>3. Perbedaan Terbagi Tingkat Tinggi:</strong>
                </p>
                <p className="font-mono text-sm">
                  Δₙ(x₁, ..., xₙ₊₁) = [Δₙ₋₁(x₂, ..., xₙ₊₁) - Δₙ₋₁(x₁, ..., xₙ)] / (xₙ₊₁ - x₁)
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Koefisien Polinom Newton</h4>
            <div className="formula-box mb-4">
              <p className="mb-2">
                <strong>Rumus Interpolasi Newton:</strong>
              </p>
              <p className="font-mono text-sm mb-3">
                P(x) = a₀ + a₁(x-x₀) + a₂(x-x₀)(x-x₁) + ... + aₙ(x-x₀)(x-x₁)...(x-xₙ₋₁)
              </p>

              <div className="mt-3">
                <p className="mb-1">
                  <strong>Koefisien:</strong>
                </p>
                <p className="font-mono text-sm mb-1">a₀ = f(x₀) = {coefficients[0].toFixed(4)}</p>
                {coefficients.slice(1).map((coef, index) => (
                  <p key={index} className="font-mono text-sm mb-1">
                    a{index + 1} = Δ{index + 1}(x₀, ..., x{index + 1}) = {coef.toFixed(4)}
                  </p>
                ))}
              </div>
            </div>

            <div className="formula-box">
              <h4 className="font-medium mb-2">Prediksi untuk Tahun {targetYear}</h4>
              <p className="mb-2">
                <strong>Substitusi x = {targetYear} ke polinom Newton:</strong>
              </p>

              {calculationSteps.map((step, index) => (
                <div key={index} className="mb-2">
                  <p className="font-mono text-sm">
                    {index === 0 ? "P(x) = " : "+ "}
                    {step.term}
                    {index > 0 && ` = ${step.calculation} = ${step.value}`}
                  </p>
                  {index < calculationSteps.length - 1 && (
                    <p className="font-mono text-sm text-muted-foreground">Subtotal: {step.running}</p>
                  )}
                </div>
              ))}

              <p className="font-mono text-sm font-medium mt-2">
                P({targetYear}) = {predictedValue.toFixed(4)} ≈ {roundedPrediction} (dibulatkan)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Visualisasi Interpolasi Newton</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={["dataMin - 1", "dataMax + 1"]}
                  label={{ value: "Tahun", position: "bottom", offset: 0 }}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  label={{ value: "Jumlah Kendaraan", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value) => [formatNumber(value), "Jumlah Kendaraan"]}
                  labelFormatter={(label) => `Tahun ${label}`}
                />
                <Scatter name="Data Historis" data={scatterData} fill="hsl(var(--chart-3))" />
                <Scatter name="Prediksi" data={predictionPoints} fill="hsl(var(--chart-2))" />
                <Line
                  name="Kurva Interpolasi"
                  data={interpolationCurveData}
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-2))"
                  dot={false}
                  activeDot={false}
                  strokeWidth={2}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 p-3 bg-secondary rounded-lg">
          <p className="text-sm">
            <strong>Interpretasi:</strong> Interpolasi Newton menghasilkan kurva yang melewati semua titik data historis
            dengan tepat. Metode ini dapat menangkap pola non-linear dalam data. Untuk tahun {targetYear}, prediksi
            jumlah kendaraan adalah {formatNumber(roundedPrediction)} unit.
          </p>
        </div>
      </Card>
    )
  }

  return <div>Pilih metode perhitungan untuk melihat visualisasi</div>
}
