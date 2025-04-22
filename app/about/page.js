import { Card } from "@/components/ui/card"
import { Calculator, Database, LineChart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tentang Aplikasi</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Deskripsi Aplikasi</h2>
          <p className="mb-4">
            Aplikasi Prediksi Jumlah Kendaraan Bermotor di Kota Tasikmalaya adalah sebuah platform yang dikembangkan
            untuk membantu memprediksi jumlah kendaraan bermotor di Kota Tasikmalaya untuk periode 2024-2028 berdasarkan
            data historis tahun 2019-2023.
          </p>
          <p>
            Aplikasi ini menggunakan metode regresi linier dan interpolasi polinom Newton untuk memberikan estimasi yang
            akurat tentang pertumbuhan jumlah kendaraan bermotor di masa depan. Hasil prediksi dapat digunakan untuk
            perencanaan infrastruktur, kebijakan transportasi, dan analisis lalu lintas di Kota Tasikmalaya.
          </p>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Metode Prediksi</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <LineChart className="h-6 w-6 text-green-600 mt-1" />
              <h3 className="text-lg font-semibold">Regresi Linier</h3>
            </div>
            <p className="text-gray-700">
              Metode regresi linier digunakan untuk memodelkan hubungan antara tahun (variabel independen) dan jumlah
              kendaraan (variabel dependen) dengan mencari garis lurus terbaik yang meminimalkan jumlah kuadrat selisih
              antara nilai prediksi dan nilai aktual.
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="font-mono text-sm">y = mx + b</p>
              <p className="text-xs text-gray-600 mt-1">
                Dimana y adalah jumlah kendaraan, x adalah tahun, m adalah kemiringan garis, dan b adalah titik potong.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <Calculator className="h-6 w-6 text-green-600 mt-1" />
              <h3 className="text-lg font-semibold">Interpolasi Polinom Newton</h3>
            </div>
            <p className="text-gray-700">
              Interpolasi polinom Newton digunakan untuk memodelkan pola non-linear dalam data dengan menggunakan
              polinom berderajat tinggi yang melewati semua titik data historis, memberikan fleksibilitas lebih dalam
              memodelkan tren yang kompleks.
            </p>
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="font-mono text-sm">P(x) = a₀ + a₁(x-x₀) + a₂(x-x₀)(x-x₁) + ...</p>
              <p className="text-xs text-gray-600 mt-1">
                Dimana P(x) adalah jumlah kendaraan yang diprediksi, x adalah tahun, dan a₀, a₁, a₂, ... adalah
                koefisien.
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <Database className="h-6 w-6 text-green-600 mt-1" />
            <h2 className="text-xl font-semibold">Sumber Data</h2>
          </div>
          <p className="mb-4">
            Data yang digunakan dalam aplikasi ini bersumber dari Dinas Perhubungan Kota Tasikmalaya periode 2019-2023.
            Data mencakup berbagai jenis kendaraan bermotor seperti:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Mobil Penumpang</li>
            <li>Bus</li>
            <li>Truk</li>
            <li>Sepeda Motor</li>
            <li>Kendaraan Khusus</li>
          </ul>
          <p>
            Data historis ini digunakan sebagai dasar untuk memprediksi pertumbuhan jumlah kendaraan di masa depan
            menggunakan metode statistik yang telah dijelaskan di atas.
          </p>
        </Card>
      </div>
    </div>
  )
}
