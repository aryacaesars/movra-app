import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

interface PredictionTableProps {
  data: any
}

export default function PredictionTable({ data }: PredictionTableProps) {
  if (!data) return <div>Tidak ada data untuk ditampilkan</div>

  const historicalData = data.historicalData || []
  const predictionData = data.predictions || []

  // Format angka dengan pemisah ribuan
  const formatNumber = (num: string | number) => {
    return new Intl.NumberFormat("id-ID").format(Number.parseInt(num.toString()))
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Tabel Prediksi Jumlah Kendaraan {data.vehicleType}</h3>
        <p className="text-sm text-gray-500">Data historis dan hasil prediksi</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tahun</TableHead>
              <TableHead>Jumlah Kendaraan</TableHead>
              <TableHead>Jenis Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historicalData.map((item: any) => (
              <TableRow key={`historical-${item.year}`}>
                <TableCell>{item.year}</TableCell>
                <TableCell>{formatNumber(item.count)}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">Data Historis</span>
                </TableCell>
              </TableRow>
            ))}

            {predictionData.map((item: any) => (
              <TableRow key={`prediction-${item.year}`} className="bg-green-50">
                <TableCell>{item.year}</TableCell>
                <TableCell>{formatNumber(item.count)}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">Prediksi</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm">
          <strong>Metode Prediksi:</strong> Regresi Linier dan Interpolasi Polinom Newton
        </p>
      </div>
    </Card>
  )
}
