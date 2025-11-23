"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, X } from "lucide-react"
import Link from "next/link"
import { manageStandardPlan, getCropTypesWithVarieties } from "@/actions/admin-actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewPlanPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [cropTypes, setCropTypes] = useState<any[]>([])
    const [selectedVarietyIds, setSelectedVarietyIds] = useState<string[]>([])
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const types = await getCropTypesWithVarieties()
                setCropTypes(types)
            } catch (error) {
                console.error("Error loading crop types:", error)
            } finally {
                setDataLoading(false)
            }
        }
        loadData()
    }, [])

    const handleVarietyToggle = (varietyId: string) => {
        setSelectedVarietyIds((prev) =>
            prev.includes(varietyId)
                ? prev.filter((id) => id !== varietyId)
                : [...prev, varietyId]
        )
    }

    const getSelectedVarieties = () => {
        const varieties: any[] = []
        cropTypes.forEach((type) => {
            type.varieties.forEach((variety: any) => {
                if (selectedVarietyIds.includes(variety.id)) {
                    varieties.push({ ...variety, cropType: type })
                }
            })
        })
        return varieties
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedVarietyIds.length === 0) {
            alert("กรุณาเลือกพันธุ์พืชอย่างน้อย 1 รายการ")
            return
        }

        setLoading(true)

        try {
            await manageStandardPlan("create", {
                ...formData,
                cropVarietyIds: selectedVarietyIds,
            })
            router.push("/admin/plans")
            router.refresh()
        } catch (error) {
            console.error("Error creating plan:", error)
            alert("เกิดข้อผิดพลาดในการสร้างแผน")
        } finally {
            setLoading(false)
        }
    }

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    const selectedVarieties = getSelectedVarieties()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/admin/plans">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">เพิ่มแผนการปลูกใหม่</h1>
                    <p className="text-muted-foreground">สร้างแผนการปลูกมาตรฐาน</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลแผนการปลูก</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อแผน *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="เช่น แผนการปลูกอ้อยมาตรฐาน"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">คำอธิบาย</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="รายละเอียดเกี่ยวกับแผนนี้..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>พันธุ์พืชที่เลือก ({selectedVarieties.length})</Label>
                                {selectedVarieties.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">ยังไม่ได้เลือกพันธุ์พืช</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVarieties.map((variety) => (
                                            <Badge key={variety.id} variant="secondary" className="gap-1 pr-1">
                                                {variety.cropType.nameTh || variety.cropType.name} - {variety.nameTh || variety.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleVarietyToggle(variety.id)}
                                                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
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

                {/* Right: Variety Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>เลือกพันธุ์พืช</CardTitle>
                        <p className="text-sm text-muted-foreground">เลือกพันธุ์พืชที่ต้องการใช้แผนนี้</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {cropTypes.map((type) => (
                                <div key={type.id} className="space-y-2">
                                    <h3 className="font-semibold text-sm text-gray-700">
                                        {type.nameTh || type.name}
                                    </h3>
                                    <div className="space-y-2 ml-2">
                                        {type.varieties.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">ไม่มีพันธุ์</p>
                                        ) : (
                                            type.varieties.map((variety: any) => (
                                                <div key={variety.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={variety.id}
                                                        checked={selectedVarietyIds.includes(variety.id)}
                                                        onCheckedChange={() => handleVarietyToggle(variety.id)}
                                                    />
                                                    <label
                                                        htmlFor={variety.id}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {variety.nameTh || variety.name}
                                                        {variety.growthPeriodDays && (
                                                            <span className="text-muted-foreground ml-2">
                                                                ({variety.growthPeriodDays} วัน)
                                                            </span>
                                                        )}
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
