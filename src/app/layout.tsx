import { Inter } from "next/font/google"
import "../styles/globals.css"
import "../styles/layout.css"
import { ReactNode } from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { GlobalLayout } from "@/components/layout/global-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://paddle-billing.vercel.app"),
  title: "BiziApps",
  description:
    "BiziApps is a powerful team design collaboration app and image editor. With plans for businesses of all sizes, streamline your workflow with real-time collaboration, advanced editing tools, and seamless project management.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className={"min-h-full dark"}>
      <body className={inter.className}>
        <GlobalLayout>{children}</GlobalLayout>
        <Toaster />
      </body>
    </html>
  )
}
