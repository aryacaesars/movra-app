import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

export default function PredictionTable({ data }) {
  if (!data) return <div>Tidak ada data untuk ditampilkan</div>

  const historicalData = data.historicalData || []
  const linearPredictions = data.linearPredictions || []
  const interpolationPredictions = data.interpolationPredictions || []

  // Format angka dengan pemisah ribuan
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(Number.parseInt(num.toString()))
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Tabel Prediksi Jumlah Kendaraan {data.vehicleType}</h3>
        <p className="text-sm text-muted-foreground">Data historis dan hasil prediksi dengan dua metode</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tahun</TableHead>
              <TableHead>Data Historis</TableHead>
              <TableHead>Regresi Linier</TableHead>
              <TableHead>Interpolasi Newton</TableHead>
              <TableHead>Selisih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Historical data rows */}
            {historicalData.map((item) => {
              // Find matching prediction years if any
              const linearMatch = linearPredictions.find((p) => p.year === item.year)
              const interpolationMatch = interpolationPredictions.find((p) => p.year === item.year)

              return (
                <TableRow key={`historical-${item.year}`}>
                  <TableCell>{item.year}</TableCell>
                  <TableCell>{formatNumber(item.count)}</TableCell>
                  <TableCell>{linearMatch ? formatNumber(linearMatch.count) : "-"}</TableCell>
                  <TableCell>{interpolationMatch ? formatNumber(interpolationMatch.count) : "-"}</TableCell>
                  <TableCell>
                    {linearMatch && interpolationMatch
                      ? formatNumber(
                          Math.abs(Number.parseInt(linearMatch.count) - Number.parseInt(interpolationMatch.count)),
                        )
                      : "-"}
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Prediction-only rows */}
            {linearPredictions
              .filter((item) => !historicalData.some((h) => h.year === item.year))
              .map((item) => {
                const interpolationMatch = interpolationPredictions.find((p) => p.year === item.year)

                return (
                  <TableRow key={`prediction-${item.year}`} className="bg-brand-subtle/30 dark:bg-brand-subtle/10">
                    <TableCell>{item.year}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{formatNumber(item.count)}</TableCell>
                    <TableCell>{interpolationMatch ? formatNumber(interpolationMatch.count) : "-"}</TableCell>
                    <TableCell>
                      {interpolationMatch
                        ? formatNumber(
                            Math.abs(Number.parseInt(item.count) - Number.parseInt(interpolationMatch.count)),
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-3 bg-secondary rounded-lg">
        <p className="text-sm">
          <strong>Metode Prediksi:</strong> Regresi Linier dan Interpolasi Polinom Newton
        </p>
      </div>
    </Card>
  )
}
