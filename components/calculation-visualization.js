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
  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(Number(num))
  const x = historicalData.map((d) => d.year)
  const y = historicalData.map((d) => Number(d.count))
  const scatterData = historicalData.map((d) => ({ year: d.year, value: Number(d.count) }))

  if (method === "linear") {
    // Hanya tampilkan visualisasi grafik regresi linier
    return (
      <Card className="calculation-section">
        <h3 className="text-xl font-bold mb-4 text-brand">Visualisasi Regresi Linier</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" type="number" domain={["dataMin - 1", "dataMax + 1"]} label={{ value: "Tahun", position: "bottom", offset: 0 }} />
              <YAxis tickFormatter={formatNumber} label={{ value: "Jumlah Kendaraan", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value) => [formatNumber(value), "Jumlah Kendaraan"]} labelFormatter={(label) => `Tahun ${label}`} />
              <Scatter name="Data Historis" data={scatterData} fill="hsl(var(--chart-3))" />
              <Scatter name="Prediksi" data={data.linearPredictions.map((d) => ({ year: d.year, value: Number(d.count) }))} fill="hsl(var(--chart-1))" />
              <Line name="Garis Regresi" data={(() => {
                const slope = data.linearRegression.slope
                const intercept = data.linearRegression.intercept
                const minYear = Math.min(...x)
                const maxYear = Math.max(...data.linearPredictions.map((p) => p.year))
                const regressionLineData = []
                for (let yearPoint = minYear; yearPoint <= maxYear; yearPoint++) {
                  regressionLineData.push({ year: yearPoint, value: Math.round(slope * yearPoint + intercept) })
                }
                return regressionLineData
              })()} type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" dot={false} activeDot={false} strokeWidth={2} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>
    )
  } else if (method === "interpolation") {
    // Hanya tampilkan visualisasi grafik interpolasi Newton
    return (
      <Card className="calculation-section">
        <h3 className="text-xl font-bold mb-4 text-brand">Visualisasi Interpolasi Polinom Newton</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" type="number" domain={["dataMin - 1", "dataMax + 1"]} label={{ value: "Tahun", position: "bottom", offset: 0 }} />
              <YAxis tickFormatter={formatNumber} label={{ value: "Jumlah Kendaraan", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value) => [formatNumber(value), "Jumlah Kendaraan"]} labelFormatter={(label) => `Tahun ${label}`} />
              <Scatter name="Data Historis" data={scatterData} fill="hsl(var(--chart-3))" />
              <Scatter name="Prediksi" data={data.interpolationPredictions.map((d) => ({ year: d.year, value: Number(d.count) }))} fill="hsl(var(--chart-2))" />
              <Line name="Kurva Interpolasi" data={(() => {
                const coefficients = data.newtonInterpolation?.coefficients || []
                const minYear = Math.min(...x)
                const maxYear = Math.max(...data.interpolationPredictions.map((p) => p.year))
                const interpolationCurveData = []
                for (let yearPoint = minYear; yearPoint <= maxYear; yearPoint += 0.1) {
                  let result = coefficients[0]
                  let term = 1
                  for (let j = 1; j < coefficients.length; j++) {
                    term *= yearPoint - x[j - 1]
                    result += coefficients[j] * term
                  }
                  interpolationCurveData.push({ year: yearPoint, value: result })
                }
                return interpolationCurveData
              })()} type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" dot={false} activeDot={false} strokeWidth={2} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>
    )
  }
  return <div>Pilih metode perhitungan untuk melihat visualisasi</div>
}
