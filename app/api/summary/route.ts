import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "startDate and endDate are required" },
                { status: 400 }
            )
        }

        // Fetch all plots with their cycles and activities
        const plots = await prisma.plot.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                plantingCycles: {
                    include: {
                        cropVariety: {
                            include: {
                                cropType: true,
                            },
                        },
                        activities: {
                            where: {
                                activityDate: {
                                    gte: new Date(startDate),
                                    lte: new Date(endDate),
                                },
                            },
                        },
                    },
                },
            },
        })

        const activePlots: any[] = []
        const completedPlots: any[] = []

        for (const plot of plots) {
            for (const cycle of plot.plantingCycles) {
                const stats = {
                    totalCost: cycle.activities.reduce((sum, act) => sum + act.cost, 0),
                    totalIncome: cycle.activities.reduce((sum, act) => sum + act.income, 0),
                    netProfit: 0,
                    activityCount: cycle.activities.length,
                }
                stats.netProfit = stats.totalIncome - stats.totalCost

                const plotSummary = {
                    id: cycle.id, // Use cycle.id as unique key
                    plotId: plot.id, // Keep plot.id for navigation
                    name: plot.name,
                    status: cycle.status,
                    cropName: cycle.cropVariety.nameTh || cycle.cropVariety.name,
                    stats,
                    startDate: cycle.startDate,
                    endDate: cycle.endDate,
                }

                if (cycle.status === "ACTIVE") {
                    activePlots.push(plotSummary)
                } else if (cycle.status === "COMPLETED") {
                    completedPlots.push(plotSummary)
                }
            }
        }

        return NextResponse.json({
            activePlots,
            completedPlots,
        })
    } catch (error) {
        console.error("Error fetching summary:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
