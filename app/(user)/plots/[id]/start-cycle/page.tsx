"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { startPlantingCycle } from "@/actions/cycle-actions"
import { getCropTypesWithVarieties, getStandardPlans } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StartCyclePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)

    // Data from API
    const [cropTypes, setCropTypes] = useState<any[]>([])
    const [standardPlans, setStandardPlans] = useState<any[]>([])

    // Form State
    const [selectedCropType, setSelectedCropType] = useState("")
    const [selectedVariety, setSelectedVariety] = useState("")
    const [selectedPlan, setSelectedPlan] = useState("none")
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [types, plans] = await Promise.all([
                    getCropTypesWithVarieties(),
                    getStandardPlans(),
                ])
                setCropTypes(types)
                setStandardPlans(plans)
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setDataLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedVariety) return

        setLoading(true)
        try {
            await startPlantingCycle(
                id,
                selectedVariety,
                new Date(startDate),
                selectedPlan === "none" ? undefined : selectedPlan
            )
            router.push(`/plots/${id}`)
            router.refresh()
        } catch (error) {
            console.error("Error starting cycle:", error)
            alert("เกิดข้อผิดพลาดในการเริ่มรอบการปลูก")
        } finally {
            setLoading(false)
        }
    }

    // Filter varieties based on selected crop type
    const availableVarieties = selectedCropType
        ? cropTypes.find(t => t.id === selectedCropType)?.varieties || []
        : []

    // Filter plans based on selected variety
    const availablePlans = selectedVariety
        ? standardPlans.filter(p => p.cropVarietyId === selectedVariety)
        : []

    if (dataLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
            <Link
                href={`/plots/${id}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                กลับไปหน้าแปลง
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>เริ่มรอบการปลูกใหม่ 🌱</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Crop Type Selection */}
                        <div className="space-y-2">
                            <Label>ประเภทพืช *</Label>
                            <Select
                                value={selectedCropType}
                                onValueChange={(value) => {
                                    setSelectedCropType(value)
                                    setSelectedVariety("")
                                    setSelectedPlan("none")
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกประเภทพืช" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cropTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            <span className="flex items-center gap-2">
                                                <span>{type.icon}</span>
                                                <span>{type.nameTh || type.name}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Variety Selection */}
                        <div className="space-y-2">
                            <Label>สายพันธุ์ *</Label>
                            <Select
                                value={selectedVariety}
                                onValueChange={(value) => {
                                    setSelectedVariety(value)
                                    setSelectedPlan("none")
                                }}
                                disabled={!selectedCropType}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกสายพันธุ์" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableVarieties.map((variety: any) => (
                                        <SelectItem key={variety.id} value={variety.id}>
                                            {variety.nameTh || variety.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Standard Plan Selection */}
                        <div className="space-y-2">
                            <Label>แผนการปลูกมาตรฐาน (Optional)</Label>
                            <Select
                                value={selectedPlan}
                                onValueChange={setSelectedPlan}
                                disabled={!selectedVariety || availablePlans.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={availablePlans.length === 0 ? "ไม่มีแผนมาตรฐานสำหรับพันธุ์นี้" : "เลือกแผนการปลูก (ไม่บังคับ)"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">ไม่ใช้แผนมาตรฐาน</SelectItem>
                                    {availablePlans.map((plan: any) => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {availablePlans.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    * การเลือกแผนมาตรฐานจะช่วยสร้างตารางกิจกรรมให้อัตโนมัติ
                                </p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <Label htmlFor="startDate">วันที่เริ่มปลูก *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={loading || !selectedVariety}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                "เริ่มการปลูก"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
