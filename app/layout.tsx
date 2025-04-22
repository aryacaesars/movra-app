import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prediksi Jumlah Kendaraan Bermotor - Kota Tasikmalaya",
  description: "Aplikasi prediksi jumlah kendaraan bermotor di Kota Tasikmalaya untuk periode 2024-2028",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
