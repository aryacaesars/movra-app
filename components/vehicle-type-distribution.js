"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export default function VehicleTypeDistribution() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle types
        const typesResponse = await fetch("/api/vehicle-types")
        const typesData = await typesResponse.json()
        // Filter out "Semua Kendaraan" for the distribution chart
        const vehicleTypes = typesData.vehicleTypes.filter((type) => type !== "Semua Kendaraan") || []

        // For each vehicle type, fetch the latest data
        const distributionData = await Promise.all(
          vehicleTypes.map(async (type) => {
            const response = await fetch("/api/predict", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                vehicleType: type,
                year: 2023, // Get the latest historical data
              }),
            })
            const data = await response.json()

            // Get the latest historical data point
            const latestData = data.historicalData?.[data.historicalData.length - 1]

            return {
              name: type,
              value: latestData ? Number.parseInt(latestData.count) : 0,
            }
          }),
        )

        setData(distributionData)
      } catch (error) {
        console.error("Error fetching distribution data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Colors for the pie chart - using our brand colors
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  // Format number with thousand separator
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num)
  }

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatNumber(payload[0].value)} unit</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-4 mt-6">
      <h3 className="text-lg font-medium mb-2">Distribusi Jenis Kendaraan (2023)</h3>
      <p className="text-sm text-muted-foreground mb-4">Perbandingan jumlah kendaraan berdasarkan jenisnya</p>

      {loading ? (
        <div className="flex flex-col items-center space-y-4 py-8">
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 p-3 bg-secondary rounded-lg">
        <p className="text-sm">
          <strong>Catatan:</strong> Data distribusi menampilkan jumlah kendaraan berdasarkan data terbaru tahun 2023.
        </p>
      </div>
    </Card>
  )
}
