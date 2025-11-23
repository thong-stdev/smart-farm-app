"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPlot } from "@/actions/plot-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Import MapPicker dynamically to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/map-picker"), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
            กำลังโหลดแผนที่...
        </div>
    ),
})

export default function NewPlotPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        sizeRai: "",
        sizeNgan: "",
        sizeWa: "",
        address: "",
        latitude: 13.7563,
        longitude: 100.5018,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createPlot({
                name: formData.name,
                sizeRai: parseFloat(formData.sizeRai) || 0,
                sizeNgan: parseFloat(formData.sizeNgan) || 0,
                sizeWa: parseFloat(formData.sizeWa) || 0,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
            })

            router.push("/plots")
            router.refresh()
        } catch (error) {
            console.error("Error creating plot:", error)
            alert("เกิดข้อผิดพลาดในการสร้างแปลง")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
            <Link
                href="/plots"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                กลับไปหน้ารายการแปลง
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>สร้างแปลงใหม่</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อแปลง *</Label>
                            <Input
                                id="name"
                                placeholder="เช่น แปลงนาข้าวหอมมะลิ 1"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Size */}
                        <div className="space-y-2">
                            <Label>ขนาดพื้นที่</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.sizeRai}
                                        onChange={(e) => setFormData({ ...formData, sizeRai: e.target.value })}
                                    />
                                    <span className="text-xs text-muted-foreground">ไร่</span>
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.sizeNgan}
                                        onChange={(e) => setFormData({ ...formData, sizeNgan: e.target.value })}
                                    />
                                    <span className="text-xs text-muted-foreground">งาน</span>
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.sizeWa}
                                        onChange={(e) => setFormData({ ...formData, sizeWa: e.target.value })}
                                    />
                                    <span className="text-xs text-muted-foreground">ตร.ว.</span>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="space-y-2">
                            <Label>ตำแหน่งที่ตั้ง *</Label>
                            <div className="h-[300px] rounded-lg overflow-hidden border">
                                <MapPicker
                                    initialLat={formData.latitude}
                                    initialLng={formData.longitude}
                                    onLocationSelect={(lat, lng) =>
                                        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
                                    }
                                    height="100%"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                <div>ละติจูด: {formData.latitude.toFixed(6)}</div>
                                <div>ลองจิจูด: {formData.longitude.toFixed(6)}</div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">ที่อยู่ / จุดสังเกต</Label>
                            <Textarea
                                id="address"
                                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับที่ตั้ง..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    กำลังสร้าง...
                                </>
                            ) : (
                                "บันทึกแปลง"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
