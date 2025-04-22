"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

interface PredictionChartProps {
  data: any
}

export default function PredictionChart({ data }: PredictionChartProps) {
  // Jika data belum tersedia, tampilkan placeholder
  if (!data) return <div>Tidak ada data untuk ditampilkan</div>

  // Format data untuk chart
  const historicalData = data.historicalData || []
  const predictionData = data.predictions || []

  // Gabungkan data historis dan prediksi untuk ditampilkan dalam satu chart
  const chartData = [
    ...historicalData.map((item: any) => ({
      year: item.year,
      jumlah: Number.parseInt(item.count),
      type: "Data Historis",
    })),
    ...predictionData.map((item: any) => ({
      year: item.year,
      jumlah: Number.parseInt(item.count),
      type: "Prediksi",
    })),
  ]

  // Format angka dengan pemisah ribuan
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num)
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          Prediksi Jumlah Kendaraan {data.vehicleType} ({data.year})
        </h3>
        <p className="text-sm text-gray-500">Berdasarkan data historis 2019-2023</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              formatter={(value) => [formatNumber(value as number), "Jumlah Kendaraan"]}
              labelFormatter={(label) => `Tahun ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="jumlah"
              stroke="#10b981"
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={{ strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm">
          <strong>Hasil Prediksi:</strong> Jumlah kendaraan {data.vehicleType} pada tahun {data.year}
          diperkirakan mencapai <strong>{formatNumber(Number.parseInt(data.predictions[0]?.count || "0"))}</strong>{" "}
          unit.
        </p>
      </div>
    </Card>
  )
}
