import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Prediksi Jumlah Kendaraan Bermotor - Kota Tasikmalaya",
  description: "Aplikasi prediksi jumlah kendaraan bermotor di Kota Tasikmalaya untuk periode 2024-2028",
  generator: "v0.dev",
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-border">
              <div className="container mx-auto py-4 px-4">
                <div className="flex justify-between items-center">
                  <a href="/" className="flex items-center gap-2">
                    <div className="bg-brand rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-brand-foreground font-bold">T</span>
                    </div>
                    <h1 className="text-xl font-bold">PrediksiKendaraan</h1>
                  </a>
                  <div className="flex items-center gap-6">
                    <nav>
                      <ul className="flex space-x-6">
                        <li>
                          <a href="/" className="hover:text-brand font-medium">
                            Beranda
                          </a>
                        </li>
                        <li>
                          <a href="/prediction" className="hover:text-brand font-medium">
                            Prediksi
                          </a>
                        </li>
                        <li>
                          <a href="/about" className="hover:text-brand font-medium">
                            Tentang
                          </a>
                        </li>
                      </ul>
                    </nav>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="bg-secondary py-8">
              <div className="container mx-auto px-4 text-center">
                <p className="text-muted-foreground">
                  &copy; {new Date().getFullYear()} PrediksiKendaraan Tasikmalaya. Dibuat dengan ❤️
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
