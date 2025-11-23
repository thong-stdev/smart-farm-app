import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LiffProvider } from "@/components/liff-provider"
import { SessionProvider } from "@/components/providers/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Smart Farm Management Platform",
    description: "Manage your farm plots, planting cycles, and activities",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                {/* LINE LIFF SDK */}
                <script
                    src="https://static.line-scdn.net/liff/edge/2/sdk.js"
                    async
                ></script>
                {/* Leaflet CSS */}
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
            </head>
            <body className={inter.className}>
                <SessionProvider>
                    <LiffProvider>{children}</LiffProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
