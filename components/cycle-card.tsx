import { PlantingCycle, CropVariety, CropType, StandardPlan } from "@prisma/client"
import { formatDate, daysBetween } from "@/lib/utils"
import { Calendar, Sprout, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type CycleWithDetails = PlantingCycle & {
    cropVariety: CropVariety & {
        cropType: CropType
    }
    standardPlan?: StandardPlan | null
}

export default function CycleCard({
    cycle,
    stats,
}: {
    cycle: CycleWithDetails
    stats?: {
        totalCost: number
        totalIncome: number
        netProfit: number
        daysElapsed: number
        activityCount: number
    } | null
}) {
    const daysElapsed = daysBetween(cycle.startDate, new Date())
    const growthProgress = cycle.cropVariety.growthPeriodDays
        ? (daysElapsed / cycle.cropVariety.growthPeriodDays) * 100
        : 0

    return (
        <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-green-600" />
                            {cycle.cropVariety.cropType.name} - {cycle.cropVariety.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Active Planting Cycle
                        </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                        ACTIVE
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Started</div>
                                <div className="text-muted-foreground">
                                    {formatDate(cycle.startDate)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Days Elapsed</div>
                                <div className="text-muted-foreground">
                                    {daysElapsed}{" "}
                                    {cycle.cropVariety.growthPeriodDays &&
                                        `/ ${cycle.cropVariety.growthPeriodDays} days`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {cycle.cropVariety.growthPeriodDays && (
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Growth Progress</span>
                                <span className="font-medium">{Math.min(growthProgress, 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(growthProgress, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{stats.activityCount}</div>
                                <div className="text-xs text-muted-foreground">Activities</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {(stats.totalCost / 1000).toFixed(1)}k
                                </div>
                                <div className="text-xs text-muted-foreground">Cost (THB)</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {(stats.totalIncome / 1000).toFixed(1)}k
                                </div>
                                <div className="text-xs text-muted-foreground">Income (THB)</div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
