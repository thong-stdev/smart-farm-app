import { notFound } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Calendar, Sprout, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

async function getPlotHistory(plotId: string, userId: string) {
    const plot = await prisma.plot.findUnique({
        where: { id: plotId, userId },
        include: {
            plantingCycles: {
                where: {
                    status: {
                        in: ["COMPLETED", "ABANDONED"],
                    },
                },
                include: {
                    cropVariety: {
                        include: {
                            cropType: true,
                        },
                    },
                    activities: true,
                },
                orderBy: {
                    startDate: "desc",
                },
            },
        },
    })

    return plot
}

function calculateCycleStats(cycle: any) {
    const totalCost = cycle.activities.reduce((sum: number, act: any) => sum + act.cost, 0)
    const totalIncome = cycle.activities.reduce((sum: number, act: any) => sum + act.income, 0)
    const netProfit = totalIncome - totalCost

    const startDate = new Date(cycle.startDate)
    const endDate = cycle.endDate ? new Date(cycle.endDate) : new Date()
    const daysElapsed = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return { totalCost, totalIncome, netProfit, daysElapsed }
}

export default async function PlotHistoryPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await auth()
    if (!session?.user?.id) {
        notFound()
    }

    const plot = await getPlotHistory(params.id, session.user.id)

    if (!plot) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="mb-6">
                <Link
                    href={`/plots/${plot.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปยังแปลง
                </Link>
                <h1 className="text-3xl font-bold mb-2">ประวัติการปลูก</h1>
                <p className="text-muted-foreground">{plot.name}</p>
            </div>

            {plot.plantingCycles.length > 0 ? (
                <div className="space-y-4">
                    {plot.plantingCycles.map((cycle) => {
                        const stats = calculateCycleStats(cycle)
                        const statusText = cycle.status === "COMPLETED" ? "เสร็จสิ้น" : "ยกเลิก"
                        const statusColor = cycle.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"

                        return (
                            <Card key={cycle.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <Sprout className="w-5 h-5 text-green-600" />
                                                {cycle.cropVariety.nameTh || cycle.cropVariety.name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {cycle.cropVariety.cropType.nameTh || cycle.cropVariety.cropType.name}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                                            {statusText}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Date Range */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(cycle.startDate).toLocaleDateString("th-TH")}
                                            {" - "}
                                            {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                                        </span>
                                        <span className="text-xs">({stats.daysElapsed} วัน)</span>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground mb-1">ต้นทุน</div>
                                            <div className="font-bold text-red-600">
                                                ฿{stats.totalCost.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground mb-1">รายได้</div>
                                            <div className="font-bold text-green-600">
                                                ฿{stats.totalIncome.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-muted-foreground mb-1">กำไรสุทธิ</div>
                                            <div className={`font-bold ${stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                ฿{stats.netProfit.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity Count */}
                                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                                        บันทึกกิจกรรม {cycle.activities.length} ครั้ง
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีประวัติการปลูก</h3>
                        <p className="text-muted-foreground mb-6">
                            ประวัติจะแสดงเมื่อคุณสิ้นสุดรอบการปลูก
                        </p>
                        <Button asChild>
                            <Link href={`/plots/${plot.id}`}>กลับไปยังแปลง</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
