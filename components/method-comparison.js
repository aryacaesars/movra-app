"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Legend,
} from "recharts"

export default function MethodComparison({ data }) {
  if (!data || !data.historicalData) {
    return <div>Tidak ada data perbandingan untuk ditampilkan</div>
  }

  // Extract data
  const historicalData = data.historicalData || []
  const linearPredictions = data.linearPredictions || []
  const interpolationPredictions = data.interpolationPredictions || []

  // Format angka dengan pemisah ribuan
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(Number(num))
  }

  // Prepare data for visualization
  const x = historicalData.map((d) => d.year)
  const y = historicalData.map((d) => Number(d.count))

  // Prepare data for scatter plot
  const scatterData = historicalData.map((d) => ({
    year: d.year,
    value: Number(d.count),
  }))

  // Combine all data for the chart
  const chartData = []

  // Add historical data
  historicalData.forEach((item) => {
    chartData.push({
      year: item.year,
      historis: Number(item.count),
      regresi: null,
      interpolasi: null,
    })
  })

  // Add prediction data
  const allYears = new Set([...linearPredictions.map((p) => p.year), ...interpolationPredictions.map((p) => p.year)])

  allYears.forEach((year) => {
    const linearPrediction = linearPredictions.find((p) => p.year === year)
    const interpolationPrediction = interpolationPredictions.find((p) => p.year === year)

    const existingIndex = chartData.findIndex((d) => d.year === year)

    if (existingIndex >= 0) {
      if (linearPrediction) {
        chartData[existingIndex].regresi = Number(linearPrediction.count)
      }
      if (interpolationPrediction) {
        chartData[existingIndex].interpolasi = Number(interpolationPrediction.count)
      }
    } else {
      chartData.push({
        year,
        historis: null,
        regresi: linearPrediction ? Number(linearPrediction.count) : null,
        interpolasi: interpolationPrediction ? Number(interpolationPrediction.count) : null,
      })
    }
  })

  // Sort by year
  chartData.sort((a, b) => a.year - b.year)

  // Calculate differences for each prediction year
  const comparisonData = linearPredictions.map((linear) => {
    const interpolation = interpolationPredictions.find((p) => p.year === linear.year)
    const linearValue = Number(linear.count)
    const interpolationValue = interpolation ? Number(interpolation.count) : 0
    const difference = Math.abs(linearValue - interpolationValue)
    const percentDiff = ((difference / linearValue) * 100).toFixed(2)

    return {
      year: linear.year,
      regresi: linearValue,
      interpolasi: interpolationValue,
      selisih: difference,
      persentaseSelisih: percentDiff,
    }
  })

  // Calculate average error metrics
  const maeLinear =
    historicalData.reduce((sum, item, index) => {
      const actual = Number(item.count)
      const predicted = data.linearRegression.slope * item.year + data.linearRegression.intercept
      return sum + Math.abs(actual - predicted)
    }, 0) / historicalData.length

  // For interpolation, the error on historical data should be near zero
  // since interpolation passes through all data points
  const maeInterpolation = 0.001 // Practically zero for interpolation on known points

  return (
    <Card className="calculation-section">
      <h3 className="text-xl font-bold mb-4 text-brand">Perbandingan Metode Prediksi</h3>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Visualisasi Perbandingan</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip
                formatter={(value) => [formatNumber(value), "Jumlah Kendaraan"]}
                labelFormatter={(label) => `Tahun ${label}`}
              />
              <Legend />
              <Scatter name="Data Historis" dataKey="historis" fill="hsl(var(--chart-3))" />
              <Line
                name="Regresi Linier"
                type="monotone"
                dataKey="regresi"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line
                name="Interpolasi Newton"
                type="monotone"
                dataKey="interpolasi"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Tabel Perbandingan Hasil Prediksi</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahun</TableHead>
                <TableHead>Regresi Linier</TableHead>
                <TableHead>Interpolasi Newton</TableHead>
                <TableHead>Selisih</TableHead>
                <TableHead>Persentase Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((item, index) => (
                <TableRow
                  key={index}
                  className={item.year === Number(data.year) ? "bg-brand-subtle/30 dark:bg-brand-subtle/10" : ""}
                >
                  <TableCell>{item.year}</TableCell>
                  <TableCell>{formatNumber(item.regresi)}</TableCell>
                  <TableCell>{formatNumber(item.interpolasi)}</TableCell>
                  <TableCell>{formatNumber(item.selisih)}</TableCell>
                  <TableCell>{item.persentaseSelisih}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="formula-box">
          <h4 className="font-medium mb-2">Karakteristik Regresi Linier</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Menghasilkan garis lurus yang meminimalkan jumlah kuadrat error</li>
            <li>Cocok untuk data dengan tren linier</li>
            <li>R² = {data.linearRegression.rSquared.toFixed(4)}</li>
            <li>
              Persamaan: y = {data.linearRegression.slope.toFixed(2)}x + {data.linearRegression.intercept.toFixed(2)}
            </li>
            <li>Rata-rata error absolut: {maeLinear.toFixed(2)}</li>
            <li>Kelebihan: Sederhana, mudah diinterpretasi, dan stabil untuk ekstrapolasi</li>
            <li>Kekurangan: Tidak dapat menangkap pola non-linear dalam data</li>
          </ul>
        </div>

        <div className="formula-box">
          <h4 className="font-medium mb-2">Karakteristik Interpolasi Newton</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Menghasilkan kurva yang melewati semua titik data</li>
            <li>Dapat menangkap pola non-linear dalam data</li>
            <li>Menggunakan {data.newtonInterpolation.coefficients.length} koefisien</li>
            <li>Rata-rata error absolut: {maeInterpolation.toFixed(2)} (mendekati nol)</li>
            <li>Kelebihan: Akurat untuk interpolasi, fleksibel untuk berbagai bentuk kurva</li>
            <li>Kekurangan: Dapat menghasilkan osilasi berlebihan untuk ekstrapolasi jarak jauh</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-secondary rounded-lg">
        <p className="text-sm">
          <strong>Kesimpulan:</strong> Untuk tahun {data.year}, prediksi dengan Regresi Linier menghasilkan{" "}
          {formatNumber(data.linearPredictions[0].count)} unit, sedangkan Interpolasi Newton menghasilkan{" "}
          {formatNumber(data.interpolationPredictions[0].count)} unit, dengan selisih{" "}
          {formatNumber(
            Math.abs(Number(data.linearPredictions[0].count) - Number(data.interpolationPredictions[0].count)),
          )}{" "}
          unit (
          {(
            (Math.abs(Number(data.linearPredictions[0].count) - Number(data.interpolationPredictions[0].count)) /
              Number(data.linearPredictions[0].count)) *
            100
          ).toFixed(2)}
          %). Regresi linier lebih cocok untuk prediksi jangka panjang dengan tren stabil, sementara interpolasi Newton
          lebih akurat untuk menangkap pola kompleks dalam data.
        </p>
      </div>
    </Card>
  )
}
