import { notFound } from "next/navigation"
import { getPlotWithActiveCycle } from "@/actions/plot-actions"
import { getCycleStats } from "@/actions/cycle-actions"
import Link from "next/link"
import { MapPin, Calendar, TrendingUp, DollarSign } from "lucide-react"
import ActivityList from "@/components/activity-list"
import CycleCard from "@/components/cycle-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PlotDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const plot = await getPlotWithActiveCycle(id)

    if (!plot) {
        notFound()
    }

    const activeCycle = plot.plantingCycles[0] || null
    let cycleStats = null

    if (activeCycle) {
        cycleStats = await getCycleStats(activeCycle.id)
    }

    // Calculate total land size in Rai
    const totalRai =
        (plot.sizeRai || 0) +
        (plot.sizeNgan || 0) / 4 +
        (plot.sizeWa || 0) / 400

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Plot Header */}
            <div className="mb-6">
                <Link
                    href="/plots"
                    className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
                >
                    ← กลับไปยังแปลงเกษตร
                </Link>
                <h1 className="text-3xl font-bold mb-2">{plot.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                            {plot.latitude.toFixed(6)}, {plot.longitude.toFixed(6)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{totalRai.toFixed(2)} ไร่</span>
                    </div>
                </div>
                {plot.address && (
                    <p className="text-sm text-muted-foreground mt-2">{plot.address}</p>
                )}
            </div>

            {/* Active Cycle Section */}
            {activeCycle ? (
                <>
                    <CycleCard cycle={activeCycle} stats={cycleStats} />

                    {/* Cycle Statistics */}
                    {cycleStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        จำนวนวัน
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-2xl font-bold">
                                            {cycleStats.daysElapsed}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        ต้นทุนรวม
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-red-500" />
                                        <span className="text-2xl font-bold text-red-500">
                                            {cycleStats.totalCost.toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        รายได้รวม
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <span className="text-2xl font-bold text-green-500">
                                            {cycleStats.totalIncome.toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        กำไรสุทธิ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        <span
                                            className={`text-2xl font-bold ${cycleStats.netProfit >= 0
                                                ? "text-green-500"
                                                : "text-red-500"
                                                }`}
                                        >
                                            {cycleStats.netProfit.toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Activity Log */}
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>บันทึกกิจกรรม</CardTitle>
                            <Button asChild size="sm">
                                <Link href={`/plots/${plot.id}/add-activity`}>
                                    เพิ่มกิจกรรม
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ActivityList activities={activeCycle.activities} />
                        </CardContent>
                    </Card>

                    {/* Standard Plan Timeline */}
                    {activeCycle.standardPlan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>กำหนดการตามแผนการปลูก</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {activeCycle.standardPlan.name}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activeCycle.standardPlan.tasks.map((task) => {
                                        const taskDate = new Date(activeCycle.startDate)
                                        taskDate.setDate(taskDate.getDate() + task.dayFromStart)
                                        const isPast = taskDate < new Date()

                                        return (
                                            <div
                                                key={task.id}
                                                className={`flex gap-4 p-4 rounded-lg border ${isPast
                                                    ? "bg-muted/50 border-muted"
                                                    : "bg-background border-border"
                                                    }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isPast
                                                            ? "bg-muted text-muted-foreground"
                                                            : "bg-primary text-primary-foreground"
                                                            }`}
                                                    >
                                                        D{task.dayFromStart}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold mb-1">{task.title}</h4>
                                                    {task.description && (
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{taskDate.toLocaleDateString()}</span>
                                                        <span className="px-2 py-0.5 bg-muted rounded">
                                                            {task.activityType}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-4">
                        <Button variant="outline" asChild className="flex-1">
                            <Link href={`/plots/${plot.id}/history`}>ดูประวัติ</Link>
                        </Button>
                        <Button variant="destructive" asChild className="flex-1">
                            <Link href={`/plots/${plot.id}/complete-cycle`}>
                                สิ้นสุดรอบการปลูก
                            </Link>
                        </Button>
                    </div>
                </>
            ) : (
                /* No Active Cycle */
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            ยังไม่มีรอบการปลูกที่ใช้งานอยู่ในแปลงนี้
                        </p>
                        <Button asChild>
                            <Link href={`/plots/${plot.id}/start-cycle`}>
                                เริ่มรอบการปลูกใหม่
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
