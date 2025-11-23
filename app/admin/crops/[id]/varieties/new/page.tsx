"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { manageCropVariety } from "@/actions/admin-actions"

export default function NewVarietyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: cropTypeId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        growthPeriodDays: 120,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await manageCropVariety("create", { cropTypeId, ...formData })
            router.push("/admin/crops")
            router.refresh()
        } catch (error) {
            console.error("Error creating variety:", error)
            alert("เกิดข้อผิดพลาดในการสร้างพันธุ์พืช")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/admin/crops">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">เพิ่มพันธุ์พืชใหม่</h1>
                    <p className="text-muted-foreground">เพิ่มพันธุ์พืชเข้าสู่ระบบ</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลพันธุ์พืช</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อพันธุ์ *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="เช่น เคเค 3, ข้าวหอมมะลิ 105"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="growthPeriodDays">ระยะเวลาเจริญเติบโต (วัน)</Label>
                            <Input
                                id="growthPeriodDays"
                                type="number"
                                value={formData.growthPeriodDays}
                                onChange={(e) => setFormData({ ...formData, growthPeriodDays: parseInt(e.target.value) || 0 })}
                                min={1}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">คำอธิบาย</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="รายละเอียดเกี่ยวกับพันธุ์พืชนี้..."
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    "บันทึก"
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                                ยกเลิก
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
