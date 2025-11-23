"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { completeCycle } from "@/actions/cycle-actions"
import { getPlotWithActiveCycle } from "@/actions/plot-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function CompleteCyclePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [cycleId, setCycleId] = useState<string | null>(null)
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

    useEffect(() => {
        const fetchPlot = async () => {
            try {
                const plot = await getPlotWithActiveCycle(id)
                const activeCycle = plot?.plantingCycles?.[0]

                if (activeCycle) {
                    setCycleId(activeCycle.id)
                }
            } catch (error) {
                console.error("Error fetching plot:", error)
            } finally {
                setDataLoading(false)
            }
        }
        fetchPlot()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!cycleId) {
            alert("ไม่พบรอบการปลูกที่ใช้งานอยู่")
            return
        }

        const confirmed = confirm(
            "คุณแน่ใจหรือไม่ว่าต้องการสิ้นสุดรอบการปลูกนี้?\n\nเมื่อสิ้นสุดแล้วจะไม่สามารถเพิ่มกิจกรรมใหม่ได้อีก"
        )

        if (!confirmed) return

        setLoading(true)
        try {
            await completeCycle(cycleId, new Date(endDate))
            router.push(`/plots/${id}`)
            router.refresh()
        } catch (error) {
            console.error("Error completing cycle:", error)
            alert("เกิดข้อผิดพลาดในการสิ้นสุดรอบการปลูก")
        } finally {
            setLoading(false)
        }
    }

    if (dataLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    if (!cycleId) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            ไม่พบรอบการปลูกที่ใช้งานอยู่ในแปลงนี้
                        </p>
                        <Button asChild>
                            <Link href={`/plots/${id}`}>กลับไปยังแปลง</Link>
                        </Button>
                    </CardContent>
                </Card>
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
                กลับไปยังแปลง
            </Link>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        สิ้นสุดรอบการปลูก
                    </CardTitle>
                    <CardDescription>
                        เมื่อสิ้นสุดรอบการปลูกแล้ว คุณจะไม่สามารถเพิ่มกิจกรรมใหม่ได้อีก
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="endDate">วันที่สิ้นสุด *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                เลือกวันที่เก็บเกี่ยวหรือสิ้นสุดการปลูกจริง
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                            <h4 className="font-semibold text-amber-900 text-sm">⚠️ ข้อควรระวัง</h4>
                            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                                <li>การสิ้นสุดรอบการปลูกไม่สามารถย้อนกลับได้</li>
                                <li>คุณจะไม่สามารถเพิ่มกิจกรรมใหม่ในรอบนี้ได้อีก</li>
                                <li>ควรตรวจสอบข้อมูลทั้งหมดให้ครบถ้วนก่อนสิ้นสุด</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.push(`/plots/${id}`)}
                                disabled={loading}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        กำลังดำเนินการ...
                                    </>
                                ) : (
                                    "ยืนยันสิ้นสุด"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
