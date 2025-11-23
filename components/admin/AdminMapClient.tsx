"use client"

import dynamic from "next/dynamic"

const AdminMapView = dynamic(() => import("@/components/admin/AdminMapView"), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">กำลังโหลดแผนที่...</p>
            </div>
        </div>
    ),
})

interface PlotData {
    id: string
    name: string
    latitude: number
    longitude: number
    sizeRai: number
    sizeNgan: number
    sizeWa: number
    owner: string
    activeCycle: {
        cropName: string
        cropType: string
        startDate: string
    } | null
}

interface Props {
    plots: PlotData[]
}

export default function AdminMapClient({ plots }: Props) {
    return <AdminMapView plots={plots} />
}
