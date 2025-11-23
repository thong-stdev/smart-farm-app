"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"

interface CycleStats {
    totalCost: number
    totalIncome: number
    netProfit: number
    activityCount: number
}

interface PlotSummary {
    id: string // cycle.id for unique key
    plotId: string // plot.id for navigation
    name: string
    status: "ACTIVE" | "COMPLETED"
    cropName: string
    stats: CycleStats
    startDate: string
    endDate?: string
}

async function fetchSummaryData(startDate: string, endDate: string) {
    const response = await fetch(`/api/summary?startDate=${startDate}&endDate=${endDate}`)
    if (!response.ok) throw new Error("Failed to fetch summary")
    return response.json()
}

export default function SummaryPage() {
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date()
        date.setFullYear(date.getFullYear() - 1)
        return date.toISOString().split("T")[0]
    })
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

    const [activePlots, setActivePlots] = useState<PlotSummary[]>([])
    const [completedPlots, setCompletedPlots] = useState<PlotSummary[]>([])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await fetchSummaryData(startDate, endDate)
            setActivePlots(data.activePlots || [])
            setCompletedPlots(data.completedPlots || [])
        } catch (error) {
            console.error("Error loading summary:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const calculateTotals = (plots: PlotSummary[]) => {
        return plots.reduce(
            (acc, plot) => ({
                totalCost: acc.totalCost + plot.stats.totalCost,
                totalIncome: acc.totalIncome + plot.stats.totalIncome,
                netProfit: acc.netProfit + plot.stats.netProfit,
                activityCount: acc.activityCount + plot.stats.activityCount,
            }),
            { totalCost: 0, totalIncome: 0, netProfit: 0, activityCount: 0 }
        )
    }

    const activeTotal = calculateTotals(activePlots)
    const completedTotal = calculateTotals(completedPlots)
    const grandTotal = {
        totalCost: activeTotal.totalCost + completedTotal.totalCost,
        totalIncome: activeTotal.totalIncome + completedTotal.totalIncome,
        netProfit: activeTotal.netProfit + completedTotal.netProfit,
        activityCount: activeTotal.activityCount + completedTotal.activityCount,
    }

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <h1 className="text-2xl font-bold">สรุปผลการปลูก 📊</h1>

            {/* Date Filter */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">กรองช่วงเวลา</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">วันที่เริ่มต้น</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={loadData} className="w-full bg-green-600 hover:bg-green-700">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                อัปเดตข้อมูล
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grand Total */}
            <div>
                <h2 className="text-lg font-semibold mb-3">สรุปรวมทั้งหมด</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">ต้นทุนรวม</div>
                            <div className="text-xl font-bold text-red-600 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {grandTotal.totalCost.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">รายได้รวม</div>
                            <div className="text-xl font-bold text-green-600 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {grandTotal.totalIncome.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">กำไรสุทธิ</div>
                            <div className={`text-xl font-bold flex items-center gap-1 ${grandTotal.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                }`}>
                                <TrendingUp className="w-4 h-4" />
                                {grandTotal.netProfit.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">กิจกรรมทั้งหมด</div>
                            <div className="text-xl font-bold flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {grandTotal.activityCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Active Plots Summary */}
            <div>
                <h2 className="text-lg font-semibold mb-3">
                    แปลงที่กำลังปลูก ({activePlots.length} รอบ)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <Card className="bg-green-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">ต้นทุน</div>
                            <div className="text-lg font-bold text-red-600">
                                ฿{activeTotal.totalCost.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">รายได้</div>
                            <div className="text-lg font-bold text-green-600">
                                ฿{activeTotal.totalIncome.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">กำไร</div>
                            <div className={`text-lg font-bold ${activeTotal.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                }`}>
                                ฿{activeTotal.netProfit.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">กิจกรรม</div>
                            <div className="text-lg font-bold">
                                {activeTotal.activityCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {activePlots.length > 0 ? (
                    <div className="grid gap-3">
                        {activePlots.map((plot) => (
                            <Link key={plot.id} href={`/plots/${plot.plotId}`}>
                                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold">{plot.name}</h4>
                                                <p className="text-sm text-muted-foreground">{plot.cropName}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                กำลังปลูก
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">ต้นทุน: </span>
                                                <span className="font-semibold text-red-600">
                                                    ฿{plot.stats.totalCost.toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">รายได้: </span>
                                                <span className="font-semibold text-green-600">
                                                    ฿{plot.stats.totalIncome.toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">กำไร: </span>
                                                <span className={`font-semibold ${plot.stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    ฿{plot.stats.netProfit.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            ไม่มีแปลงที่กำลังปลูกในช่วงเวลานี้
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Completed Plots Summary */}
            <div>
                <h2 className="text-lg font-semibold mb-3">
                    แปลงที่เสร็จสิ้น ({completedPlots.length} รอบ)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <Card className="bg-blue-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">ต้นทุน</div>
                            <div className="text-lg font-bold text-red-600">
                                ฿{completedTotal.totalCost.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">รายได้</div>
                            <div className="text-lg font-bold text-green-600">
                                ฿{completedTotal.totalIncome.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">กำไร</div>
                            <div className={`text-lg font-bold ${completedTotal.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                }`}>
                                ฿{completedTotal.netProfit.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                        <CardContent className="p-4">
                            <div className="text-xs text-muted-foreground mb-1">กิจกรรม</div>
                            <div className="text-lg font-bold">
                                {completedTotal.activityCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {completedPlots.length > 0 ? (
                    <div className="grid gap-3">
                        {completedPlots.map((plot) => (
                            <Link key={plot.id} href={`/plots/${plot.plotId}/history`}>
                                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold">{plot.name}</h4>
                                                <p className="text-sm text-muted-foreground">{plot.cropName}</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                                เสร็จสิ้น
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                            <div>
                                                <span className="text-muted-foreground">ต้นทุน: </span>
                                                <span className="font-semibold text-red-600">
                                                    ฿{plot.stats.totalCost.toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">รายได้: </span>
                                                <span className="font-semibold text-green-600">
                                                    ฿{plot.stats.totalIncome.toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">กำไร: </span>
                                                <span className={`font-semibold ${plot.stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    ฿{plot.stats.netProfit.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(plot.startDate).toLocaleDateString("th-TH")}
                                            {plot.endDate && ` - ${new Date(plot.endDate).toLocaleDateString("th-TH")}`}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            ไม่มีแปลงที่เสร็จสิ้นในช่วงเวลานี้
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
