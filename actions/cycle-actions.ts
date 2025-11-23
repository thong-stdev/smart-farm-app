"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Start a new planting cycle for a plot
 */
export async function startPlantingCycle(
    plotId: string,
    varietyId: string,
    startDate: Date = new Date(),
    standardPlanId?: string
) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify plot ownership
        const plot = await prisma.plot.findUnique({
            where: { id: plotId },
            include: {
                plantingCycles: {
                    where: {
                        status: "ACTIVE",
                    },
                },
            },
        })

        if (!plot || plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        // Check if there's already an active cycle
        if (plot.plantingCycles.length > 0) {
            throw new Error("Plot already has an active planting cycle")
        }

        // Get variety with standard plan
        const variety = await prisma.cropVariety.findUnique({
            where: { id: varietyId },
            include: {
                planVarieties: {
                    include: {
                        standardPlan: true,
                    },
                    take: 1, // Get the first standard plan for this variety
                },
            },
        })

        if (!variety) {
            throw new Error("Crop variety not found")
        }

        const linkedStandardPlanId = standardPlanId || variety.planVarieties[0]?.standardPlanId || null

        // Create the planting cycle
        const cycle = await prisma.plantingCycle.create({
            data: {
                plotId,
                cropVarietyId: varietyId,
                startDate,
                status: "ACTIVE",
                standardPlanId: linkedStandardPlanId,
            },
            include: {
                cropVariety: {
                    include: {
                        cropType: true,
                    },
                },
                standardPlan: {
                    include: {
                        tasks: true,
                    },
                },
            },
        })

        revalidatePath(`/plots/${plotId}`)
        revalidatePath("/plots")
        return { success: true, cycle }
    } catch (error) {
        console.error("Error starting planting cycle:", error)
        throw error
    }
}

/**
 * Complete a planting cycle
 */
export async function completeCycle(cycleId: string, endDate: Date = new Date()) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership through plot
        const cycle = await prisma.plantingCycle.findUnique({
            where: { id: cycleId },
            include: {
                plot: true,
            },
        })

        if (!cycle || cycle.plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        const updatedCycle = await prisma.plantingCycle.update({
            where: { id: cycleId },
            data: {
                status: "COMPLETED",
                endDate,
            },
        })

        revalidatePath(`/plots/${cycle.plotId}`)
        revalidatePath("/plots")
        return { success: true, cycle: updatedCycle }
    } catch (error) {
        console.error("Error completing cycle:", error)
        throw new Error("Failed to complete cycle")
    }
}

/**
 * Abandon a planting cycle
 */
export async function abandonCycle(cycleId: string, reason?: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership through plot
        const cycle = await prisma.plantingCycle.findUnique({
            where: { id: cycleId },
            include: {
                plot: true,
            },
        })

        if (!cycle || cycle.plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        // Optionally, add a note activity explaining the abandonment
        if (reason) {
            await prisma.activity.create({
                data: {
                    cycleId,
                    type: "OTHER",
                    description: `Cycle abandoned: ${reason}`,
                    activityDate: new Date(),
                },
            })
        }

        const updatedCycle = await prisma.plantingCycle.update({
            where: { id: cycleId },
            data: {
                status: "ABANDONED",
                endDate: new Date(),
            },
        })

        revalidatePath(`/plots/${cycle.plotId}`)
        revalidatePath("/plots")
        return { success: true, cycle: updatedCycle }
    } catch (error) {
        console.error("Error abandoning cycle:", error)
        throw new Error("Failed to abandon cycle")
    }
}

/**
 * Get a cycle with all its activities
 */
export async function getCycleWithActivities(cycleId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const cycle = await prisma.plantingCycle.findUnique({
            where: { id: cycleId },
            include: {
                plot: true,
                cropVariety: {
                    include: {
                        cropType: true,
                    },
                },
                standardPlan: {
                    include: {
                        tasks: {
                            orderBy: {
                                dayFromStart: "asc",
                            },
                        },
                    },
                },
                activities: {
                    orderBy: {
                        activityDate: "desc",
                    },
                },
            },
        })

        if (!cycle || cycle.plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        return cycle
    } catch (error) {
        console.error("Error fetching cycle:", error)
        throw new Error("Failed to fetch cycle")
    }
}

/**
 * Get cycle statistics (total cost, income, days elapsed)
 */
export async function getCycleStats(cycleId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const cycle = await prisma.plantingCycle.findUnique({
            where: { id: cycleId },
            include: {
                plot: true,
                activities: true,
            },
        })

        if (!cycle || cycle.plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        const totalCost = cycle.activities.reduce((sum, act) => sum + act.cost, 0)
        const totalIncome = cycle.activities.reduce((sum, act) => sum + act.income, 0)
        const netProfit = totalIncome - totalCost

        const daysElapsed = Math.floor(
            (new Date().getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        return {
            totalCost,
            totalIncome,
            netProfit,
            daysElapsed,
            activityCount: cycle.activities.length,
        }
    } catch (error) {
        console.error("Error fetching cycle stats:", error)
        throw new Error("Failed to fetch cycle stats")
    }
}
