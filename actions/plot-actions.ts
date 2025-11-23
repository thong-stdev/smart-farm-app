"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type PlotFormData = {
    name: string
    sizeRai?: number
    sizeNgan?: number
    sizeWa?: number
    latitude: number
    longitude: number
    address?: string
}

/**
 * Create a new plot for the authenticated user
 */
export async function createPlot(data: PlotFormData) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const plot = await prisma.plot.create({
            data: {
                ...data,
                userId: session.user.id,
            },
        })

        revalidatePath("/plots")
        return { success: true, plot }
    } catch (error) {
        console.error("Error creating plot:", error)
        throw new Error("Failed to create plot")
    }
}

/**
 * Update an existing plot
 */
export async function updatePlot(id: string, data: PlotFormData) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership
        const existingPlot = await prisma.plot.findUnique({
            where: { id },
        })

        if (!existingPlot || existingPlot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        const plot = await prisma.plot.update({
            where: { id },
            data,
        })

        revalidatePath("/plots")
        revalidatePath(`/plots/${id}`)
        return { success: true, plot }
    } catch (error) {
        console.error("Error updating plot:", error)
        throw new Error("Failed to update plot")
    }
}

/**
 * Delete a plot
 */
export async function deletePlot(id: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Verify ownership
        const existingPlot = await prisma.plot.findUnique({
            where: { id },
        })

        if (!existingPlot || existingPlot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        await prisma.plot.delete({
            where: { id },
        })

        revalidatePath("/plots")
        return { success: true }
    } catch (error) {
        console.error("Error deleting plot:", error)
        throw new Error("Failed to delete plot")
    }
}

/**
 * Get all plots for the authenticated user
 */
export async function getPlotsByUser() {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const plots = await prisma.plot.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                plantingCycles: {
                    where: {
                        status: "ACTIVE",
                    },
                    include: {
                        cropVariety: {
                            include: {
                                cropType: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return plots
    } catch (error) {
        console.error("Error fetching plots:", error)
        throw new Error("Failed to fetch plots")
    }
}

/**
 * Get a specific plot with its active cycle and activities
 */
export async function getPlotWithActiveCycle(plotId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const plot = await prisma.plot.findUnique({
            where: { id: plotId },
            include: {
                plantingCycles: {
                    where: {
                        status: "ACTIVE",
                    },
                    include: {
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
                },
            },
        })

        if (!plot || plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        return plot
    } catch (error) {
        console.error("Error fetching plot:", error)
        throw new Error("Failed to fetch plot")
    }
}

/**
 * Get plot history (all cycles)
 */
export async function getPlotHistory(plotId: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const plot = await prisma.plot.findUnique({
            where: { id: plotId },
            include: {
                plantingCycles: {
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

        if (!plot || plot.userId !== session.user.id) {
            throw new Error("Unauthorized")
        }

        return plot.plantingCycles
    } catch (error) {
        console.error("Error fetching plot history:", error)
        throw new Error("Failed to fetch plot history")
    }
}
