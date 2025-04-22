"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PredictionChart from "@/components/prediction-chart"
import PredictionTable from "@/components/prediction-table"
import VehicleTypeDistribution from "@/components/vehicle-type-distribution"
import { Car, TrendingUp, Table2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([])
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("")
  const [year, setYear] = useState("2024")
  const [predictionData, setPredictionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Fetch available vehicle types on component mount
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await fetch("/api/vehicle-types")
        const data = await response.json()
        setVehicleTypes(data.vehicleTypes)
        if (data.vehicleTypes.length > 0) {
          setSelectedVehicleType(data.vehicleTypes[0])
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
    } catch (error) {
      console.error("Error predicting data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Card className="p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Car className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold">Prediksi Jumlah Kendaraan Bermotor di Kota Tasikmalaya</h1>
          </div>

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
                  <Button onClick={handlePredict} className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? "Memproses..." : "Prediksi Jumlah Kendaraan"}
                  </Button>
                </div>
              </div>

              <VehicleTypeDistribution />

              {predictionData && (
                <div className="mt-8">
                  <Tabs defaultValue="chart">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Hasil Prediksi</h2>
                      <TabsList>
                        <TabsTrigger value="chart" className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Grafik
                        </TabsTrigger>
                        <TabsTrigger value="table" className="flex items-center gap-1">
                          <Table2 className="h-4 w-4" />
                          Tabel
                        </TabsTrigger>
                      </TabsList>
                    </div>

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

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Tentang Aplikasi</h3>
            <p className="text-gray-700">
              Aplikasi ini memprediksi jumlah kendaraan bermotor di Kota Tasikmalaya untuk periode 2024-2028 berdasarkan
              data historis tahun 2019-2023. Prediksi menggunakan metode regresi linier dan interpolasi polinom Newton
              untuk memberikan estimasi yang akurat.
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
