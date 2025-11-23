import { Activity } from "@prisma/client"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import {
    Sprout,
    Droplet,
    Bug,
    Tractor,
    Wheat,
    MoreHorizontal,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const activityIcons = {
    SOIL_PREPARATION: Tractor,
    PLANTING: Sprout,
    FERTILIZING: Droplet,
    PEST_CONTROL: Bug,
    IRRIGATION: Droplet,
    WEEDING: Sprout,
    HARVESTING: Wheat,
    OTHER: MoreHorizontal,
}

const activityColors = {
    SOIL_PREPARATION: "text-amber-600",
    PLANTING: "text-green-600",
    FERTILIZING: "text-blue-600",
    PEST_CONTROL: "text-red-600",
    IRRIGATION: "text-cyan-600",
    WEEDING: "text-lime-600",
    HARVESTING: "text-orange-600",
    OTHER: "text-gray-600",
}

export default function ActivityList({
    activities,
}: {
    activities: Activity[]
}) {
    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>No activities logged yet.</p>
                <p className="text-sm mt-2">Start adding activities to track your progress!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => {
                const Icon = activityIcons[activity.type]
                const colorClass = activityColors[activity.type]

                return (
                    <Card key={activity.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                {/* Icon */}
                                <div
                                    className={`flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center ${colorClass}`}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h4 className="font-semibold">
                                                {activity.type.replace(/_/g, " ")}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(activity.activityDate)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {activity.cost > 0 && (
                                                <div className="text-sm text-red-600">
                                                    -{formatCurrency(activity.cost)}
                                                </div>
                                            )}
                                            {activity.income > 0 && (
                                                <div className="text-sm text-green-600">
                                                    +{formatCurrency(activity.income)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm mb-3">{activity.description}</p>

                                    {/* Images */}
                                    {activity.images && activity.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {activity.images.map((imageUrl, index) => (
                                                <div
                                                    key={index}
                                                    className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                                                >
                                                    <Image
                                                        src={imageUrl}
                                                        alt={`Activity image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
