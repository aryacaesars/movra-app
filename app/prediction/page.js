"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Table2 } from "lucide-react"
import PredictionChart from "@/components/prediction-chart"
import PredictionTable from "@/components/prediction-table"
import VehicleTypeDistribution from "@/components/vehicle-type-distribution"

export default function PredictionPage() {
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [selectedVehicleType, setSelectedVehicleType] = useState("")
  const [year, setYear] = useState("2024")
  const [predictionData, setPredictionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

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
                  <h2 className="text-xl font-semibold mb-4">Hasil Prediksi</h2>

                  {/* Card ringkas hasil prediksi antar metode */}
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <Card className="bg-brand/10">
                      <div className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Regresi Linier</div>
                        <div className="text-3xl font-bold text-brand mb-1">
                          {predictionData.linearPredictions && predictionData.linearPredictions[0]
                            ? new Intl.NumberFormat("id-ID").format(predictionData.linearPredictions[0].count)
                            : "-"}
                        </div>
                        <div className="text-sm">unit kendaraan ({year})</div>
                      </div>
                    </Card>
                    <Card className="bg-blue-100 dark:bg-blue-900/20">
                      <div className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Interpolasi Newton</div>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                          {predictionData.interpolationPredictions && predictionData.interpolationPredictions[0]
                            ? new Intl.NumberFormat("id-ID").format(predictionData.interpolationPredictions[0].count)
                            : "-"}
                        </div>
                        <div className="text-sm">unit kendaraan ({year})</div>
                      </div>
                    </Card>
                  </div>

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
