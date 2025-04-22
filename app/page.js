import { Calculator, FileDown, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <section className="hero-section mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-heading">
                Prediksi Jumlah Kendaraan Bermotor di Tasikmalaya
              </h1>
              <p className="text-lg mb-8 text-muted-foreground">
                Aplikasi prediksi dengan metode Regresi Linier dan Interpolasi Polinom Newton untuk estimasi jumlah
                kendaraan bermotor periode 2024-2028.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/prediction">
                  <Button className="bg-brand text-brand-foreground hover:bg-brand/90 text-lg px-6 py-3 w-full sm:w-auto">
                    Mulai Prediksi
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="text-lg px-6 py-3 w-full sm:w-auto">
                    Pelajari Metode
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-brand-subtle rounded-xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className="h-24 w-24 text-brand" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fitur Utama</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Aplikasi prediksi kendaraan dengan perbandingan metode dan visualisasi perhitungan numerik
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-brand-subtle flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Dua Metode Prediksi</h3>
                <p className="text-muted-foreground">
                  Menggunakan dan membandingkan metode Regresi Linier dan Interpolasi Polinom Newton untuk hasil
                  prediksi yang lebih akurat.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-brand-subtle flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Visualisasi Perhitungan</h3>
                <p className="text-muted-foreground">
                  Menampilkan proses perhitungan numerik secara sistematis dengan visualisasi yang mudah dipahami.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-brand-subtle flex items-center justify-center mb-4">
                  <FileDown className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ekspor Hasil Detail</h3>
                <p className="text-muted-foreground">
                  Hasil prediksi dan perhitungan numerik dapat diunduh dalam format CSV dan Excel untuk analisis
                  lanjutan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="calculation-section">
            <h2 className="text-2xl font-bold mb-4">Tentang Metode Prediksi</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="method-card">
                <h3 className="text-xl font-semibold mb-3 text-brand">Regresi Linier</h3>
                <p className="mb-4 text-muted-foreground">
                  Metode statistik untuk memodelkan hubungan antara variabel dependen (jumlah kendaraan) dan variabel
                  independen (tahun) dengan mencari garis lurus terbaik.
                </p>
                <div className="formula-box">
                  <p>y = mx + b</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dimana y adalah jumlah kendaraan, x adalah tahun, m adalah kemiringan, dan b adalah konstanta.
                  </p>
                </div>
              </div>

              <div className="method-card">
                <h3 className="text-xl font-semibold mb-3 text-brand">Interpolasi Polinom Newton</h3>
                <p className="mb-4 text-muted-foreground">
                  Metode numerik yang menggunakan polinom berderajat tinggi untuk menginterpolasi titik-titik data,
                  memberikan fleksibilitas untuk pola non-linear.
                </p>
                <div className="formula-box">
                  <p>P(x) = a₀ + a₁(x-x₀) + a₂(x-x₀)(x-x₁) + ...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dimana P(x) adalah prediksi, x adalah tahun, dan a₀, a₁, a₂ adalah koefisien.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
