"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ActivityType } from "@prisma/client"

export type ActivityFormData = {
    type: ActivityType
    description: string
    activityDate?: Date
    cost?: number
    income?: number
    images?: string[]
}

/**
 * Add a new activity to a planting cycle
 */
export async function addActivity(
    cycleId: string,
    data: ActivityFormData,
    imageUrls?: string[]
) {
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

        // Check if cycle is active
        if (cycle.status !== "ACTIVE") {
            throw new Error("Cannot add activity to a non-active cycle")
        }

        const activity = await prisma.activity.create({
            data: {
                cycleId,
                type: data.type,
                description: data.description,
                activityDate: data.activityDate || new Date(),
                cost: data.cost || 0,
                income: data.income || 0,
                images: imageUrls || data.images || [],
            },
        })

        revalidatePath(`/plots/${cycle.plotId}`)
        return { success: true, activity }
    } catch (error) {
        console.error("Error adding activity:", error)
        throw error
    }
}

/**
 * Update an existing activity
 */
export async function updateActivity(id: string, data: ActivityFormData) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership through cycle -> plot
        const existingActivity = await prisma.activity.findUnique({
            where: { id },
            include: {
                cycle: {
                    include: {
                        plot: true,
                    },
                },
            },
        })

        if (!existingActivity || existingActivity.cycle.plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        const activity = await prisma.activity.update({
            where: { id },
            data: {
                type: data.type,
                description: data.description,
                activityDate: data.activityDate,
                cost: data.cost,
                income: data.income,
                images: data.images,
            },
        })

        revalidatePath(`/plots/${existingActivity.cycle.plotId}`)
        return { success: true, activity }
    } catch (error) {
        console.error("Error updating activity:", error)
        throw new Error("Failed to update activity")
    }
}

/**
 * Delete an activity
 */
export async function deleteActivity(id: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership through cycle -> plot
        const existingActivity = await prisma.activity.findUnique({
            where: { id },
            include: {
                cycle: {
                    include: {
                        plot: true,
                    },
                },
            },
        })

        if (!existingActivity || existingActivity.cycle.plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        await prisma.activity.delete({
            where: { id },
        })

        revalidatePath(`/plots/${existingActivity.cycle.plotId}`)
        return { success: true }
    } catch (error) {
        console.error("Error deleting activity:", error)
        throw new Error("Failed to delete activity")
    }
}

/**
 * Get all activities for a specific cycle
 */
export async function getActivitiesByCycle(cycleId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership
        const cycle = await prisma.plantingCycle.findUnique({
            where: { id: cycleId },
            include: {
                plot: true,
            },
        })

        if (!cycle || cycle.plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        const activities = await prisma.activity.findMany({
            where: {
                cycleId,
            },
            orderBy: {
                activityDate: "desc",
            },
        })

        return activities
    } catch (error) {
        console.error("Error fetching activities:", error)
        throw new Error("Failed to fetch activities")
    }
}

/**
 * Get activity statistics for a cycle
 */
export async function getActivityStats(cycleId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership
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

        // Group by activity type
        const statsByType = cycle.activities.reduce((acc, activity) => {
            if (!acc[activity.type]) {
                acc[activity.type] = {
                    count: 0,
                    totalCost: 0,
                    totalIncome: 0,
                }
            }
            acc[activity.type].count++
            acc[activity.type].totalCost += activity.cost
            acc[activity.type].totalIncome += activity.income
            return acc
        }, {} as Record<string, { count: number; totalCost: number; totalIncome: number }>)

        return statsByType
    } catch (error) {
        console.error("Error fetching activity stats:", error)
        throw new Error("Failed to fetch activity stats")
    }
}
