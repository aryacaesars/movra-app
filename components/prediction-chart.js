"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

export default function PredictionChart({ data }) {
  // Jika data belum tersedia, tampilkan placeholder
  if (!data) return <div>Tidak ada data untuk ditampilkan</div>

  // Format data untuk chart
  const historicalData = data.historicalData || []
  const linearPredictions = data.linearPredictions || []
  const interpolationPredictions = data.interpolationPredictions || []

  // Gabungkan data historis dan prediksi untuk ditampilkan dalam satu chart
  const chartData = [
    ...historicalData.map((item) => ({
      year: item.year,
      historis: Number.parseInt(item.count),
      regresi: null,
      interpolasi: null,
    })),
  ]

  // Add prediction data points
  linearPredictions.forEach((item) => {
    const existingIndex = chartData.findIndex((d) => d.year === item.year)
    if (existingIndex >= 0) {
      chartData[existingIndex].regresi = Number.parseInt(item.count)
    } else {
      chartData.push({
        year: item.year,
        historis: null,
        regresi: Number.parseInt(item.count),
        interpolasi: null,
      })
    }
  })

  interpolationPredictions.forEach((item) => {
    const existingIndex = chartData.findIndex((d) => d.year === item.year)
    if (existingIndex >= 0) {
      chartData[existingIndex].interpolasi = Number.parseInt(item.count)
    } else {
      chartData.push({
        year: item.year,
        historis: null,
        regresi: null,
        interpolasi: Number.parseInt(item.count),
      })
    }
  })

  // Sort by year
  chartData.sort((a, b) => a.year - b.year)

  // Format angka dengan pemisah ribuan
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num)
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          Prediksi Jumlah Kendaraan {data.vehicleType} ({data.year})
        </h3>
        <p className="text-sm text-muted-foreground">Perbandingan hasil prediksi dengan dua metode berbeda</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              formatter={(value) => [formatNumber(value), "Jumlah Kendaraan"]}
              labelFormatter={(label) => `Tahun ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="historis"
              name="Data Historis"
              stroke="hsl(var(--chart-3))"
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={{ strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="regresi"
              name="Regresi Linier"
              stroke="hsl(var(--chart-1))"
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={{ strokeWidth: 2 }}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="interpolasi"
              name="Interpolasi Newton"
              stroke="hsl(var(--chart-2))"
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={{ strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-brand-subtle rounded-lg dark:bg-brand-subtle/20">
        <p className="text-sm">
          <strong>Hasil Prediksi {data.year}:</strong> Regresi Linier:{" "}
          <strong>{formatNumber(Number.parseInt(data.linearPredictions[0]?.count || "0"))}</strong> unit | Interpolasi
          Newton: <strong>{formatNumber(Number.parseInt(data.interpolationPredictions[0]?.count || "0"))}</strong> unit
        </p>
      </div>
    </Card>
  )
}
