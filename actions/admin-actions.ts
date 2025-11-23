"use server"

// Actions for admin management
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ActivityType } from "@prisma/client"

/**
 * Get all plots for admin surveillance map
 */
export async function getAllPlotsForMap() {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const plots = await prisma.plot.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
        })

        return plots
    } catch (error) {
        console.error("Error fetching plots for map:", error)
        throw new Error("Failed to fetch plots")
    }
}

/**
 * Get dashboard statistics for admin
 */
export async function getAdminStats() {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const [
            totalUsers,
            totalPlots,
            activeCycles,
            totalActivities,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "FARMER" } }),
            prisma.plot.count(),
            prisma.plantingCycle.count({ where: { status: "ACTIVE" } }),
            prisma.activity.count(),
        ])

        return {
            totalUsers,
            totalPlots,
            activeCycles,
            totalActivities,
        }
    } catch (error) {
        console.error("Error fetching admin stats:", error)
        throw new Error("Failed to fetch statistics")
    }
}

/**
 * Get all crop types with varieties
 */
export async function getCropTypesWithVarieties() {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const cropTypes = await prisma.cropType.findMany({
            include: {
                varieties: {
                    orderBy: {
                        name: "asc",
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        })

        return cropTypes
    } catch (error) {
        console.error("Error fetching crop types:", error)
        throw new Error("Failed to fetch crop types")
    }
}

/**
 * Get a single crop type by ID
 */
export async function getCropTypeById(id: string) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const cropType = await prisma.cropType.findUnique({
            where: { id },
        })

        return cropType
    } catch (error) {
        console.error("Error fetching crop type:", error)
        throw new Error("Failed to fetch crop type")
    }
}

/**
 * Get a single variety by ID
 */
export async function getVarietyById(id: string) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const variety = await prisma.cropVariety.findUnique({
            where: { id },
            include: {
                cropType: true,
            },
        })

        return variety
    } catch (error) {
        console.error("Error fetching variety:", error)
        throw new Error("Failed to fetch variety")
    }
}

/**
 * Create or update a crop type
 */
export async function manageCropType(
    action: "create" | "update" | "delete",
    data: {
        id?: string
        name?: string
        nameEn?: string
        nameTh?: string
        description?: string
        icon?: string
    }
) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        if (action === "create") {
            const cropType = await prisma.cropType.create({
                data: {
                    name: data.name!,
                    nameEn: data.nameEn,
                    nameTh: data.nameTh,
                    description: data.description,
                    icon: data.icon,
                },
            })
            revalidatePath("/admin/crops")
            return { success: true, cropType }
        } else if (action === "update") {
            const cropType = await prisma.cropType.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    nameEn: data.nameEn,
                    nameTh: data.nameTh,
                    description: data.description,
                    icon: data.icon,
                },
            })
            revalidatePath("/admin/crops")
            return { success: true, cropType }
        } else if (action === "delete") {
            // Check if crop type is being used
            const varietyCount = await prisma.cropVariety.count({
                where: { cropTypeId: data.id },
            })
            if (varietyCount > 0) {
                throw new Error("Cannot delete crop type with existing varieties")
            }

            await prisma.cropType.delete({
                where: { id: data.id },
            })
            revalidatePath("/admin/crops")
            return { success: true }
        }
    } catch (error) {
        console.error("Error managing crop type:", error)
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to manage crop type")
    }
}

/**
 * Create or update a crop variety
 */
export async function manageCropVariety(
    action: "create" | "update" | "delete",
    data: {
        id?: string
        cropTypeId?: string
        name?: string
        nameEn?: string
        nameTh?: string
        description?: string
        growthPeriodDays?: number
    }
) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        if (action === "create") {
            const variety = await prisma.cropVariety.create({
                data: {
                    cropTypeId: data.cropTypeId!,
                    name: data.name!,
                    nameEn: data.nameEn,
                    nameTh: data.nameTh,
                    description: data.description,
                    growthPeriodDays: data.growthPeriodDays,
                },
            })
            revalidatePath("/admin/crops")
            return { success: true, variety }
        } else if (action === "update") {
            const variety = await prisma.cropVariety.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    nameEn: data.nameEn,
                    nameTh: data.nameTh,
                    description: data.description,
                    growthPeriodDays: data.growthPeriodDays,
                },
            })
            revalidatePath("/admin/crops")
            return { success: true, variety }
        } else if (action === "delete") {
            // Check if variety is being used in planting cycles
            const cycleCount = await prisma.plantingCycle.count({
                where: { cropVarietyId: data.id },
            })
            if (cycleCount > 0) {
                throw new Error("Cannot delete variety that is being used in planting cycles")
            }

            await prisma.cropVariety.delete({
                where: { id: data.id },
            })
            revalidatePath("/admin/crops")
            return { success: true }
        }
    } catch (error) {
        console.error("Error managing crop variety:", error)
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to manage crop variety")
    }
}

/**
 * Get all standard plans with tasks
 */
export async function getStandardPlans() {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const plans = await prisma.standardPlan.findMany({
            include: {
                varieties: {
                    include: {
                        cropVariety: {
                            include: {
                                cropType: true,
                            },
                        },
                    },
                },
                tasks: {
                    orderBy: {
                        dayFromStart: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return plans
    } catch (error) {
        console.error("Error fetching standard plans:", error)
        throw new Error("Failed to fetch standard plans")
    }
}

/**
 * Get a single standard plan by ID
 */
export async function getPlanById(id: string) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const plan = await prisma.standardPlan.findUnique({
            where: { id },
            include: {
                varieties: {
                    include: {
                        cropVariety: {
                            include: {
                                cropType: true,
                            },
                        },
                    },
                },
                tasks: {
                    orderBy: {
                        dayFromStart: "asc",
                    },
                },
            },
        })

        return plan
    } catch (error) {
        console.error("Error fetching plan:", error)
        throw new Error("Failed to fetch plan")
    }
}

/**
 * Create or update a standard plan
 */
export async function manageStandardPlan(
    action: "create" | "update" | "delete",
    data: {
        id?: string
        cropVarietyIds?: string[]
        name?: string
        description?: string
    }
) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        if (action === "create") {
            const plan = await prisma.standardPlan.create({
                data: {
                    name: data.name!,
                    description: data.description,
                    varieties: {
                        create: data.cropVarietyIds?.map((varietyId) => ({
                            cropVarietyId: varietyId,
                        })) || [],
                    },
                },
            })
            revalidatePath("/admin/plans")
            return { success: true, plan }
        } else if (action === "update") {
            // Update plan basic info
            const plan = await prisma.standardPlan.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    description: data.description,
                },
            })

            // Update varieties if provided
            if (data.cropVarietyIds) {
                // Delete existing links
                await prisma.planVariety.deleteMany({
                    where: { standardPlanId: data.id },
                })

                // Create new links
                await prisma.planVariety.createMany({
                    data: data.cropVarietyIds.map((varietyId) => ({
                        standardPlanId: data.id!,
                        cropVarietyId: varietyId,
                    })),
                })
            }

            revalidatePath("/admin/plans")
            return { success: true, plan }
        } else if (action === "delete") {
            await prisma.standardPlan.delete({
                where: { id: data.id },
            })
            revalidatePath("/admin/plans")
            return { success: true }
        }
    } catch (error) {
        console.error("Error managing standard plan:", error)
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to manage standard plan")
    }
}

/**
 * Add a task to a standard plan
 */
export async function addPlanTask(
    standardPlanId: string,
    task: {
        title: string
        description?: string
        dayFromStart: number
        activityType: string
    }
) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const planTask = await prisma.planTask.create({
            data: {
                standardPlanId,
                title: task.title,
                description: task.description,
                dayFromStart: task.dayFromStart,
                activityType: task.activityType as ActivityType,
            },
        })

        revalidatePath("/admin/plans")
        return { success: true, planTask }
    } catch (error) {
        console.error("Error adding plan task:", error)
        throw new Error("Failed to add plan task")
    }
}

/**
 * Update a plan task
 */
export async function updatePlanTask(
    taskId: string,
    task: {
        title: string
        description?: string
        dayFromStart: number
        activityType: string
    }
) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        const planTask = await prisma.planTask.update({
            where: { id: taskId },
            data: {
                title: task.title,
                description: task.description,
                dayFromStart: task.dayFromStart,
                activityType: task.activityType as ActivityType,
            },
        })

        revalidatePath("/admin/plans")
        return { success: true, planTask }
    } catch (error) {
        console.error("Error updating plan task:", error)
        throw new Error("Failed to update plan task")
    }
}

/**
 * Delete a plan task
 */
export async function deletePlanTask(taskId: string) {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.planTask.delete({
            where: { id: taskId },
        })

        revalidatePath("/admin/plans")
        return { success: true }
    } catch (error) {
        console.error("Error deleting plan task:", error)
        throw new Error("Failed to delete plan task")
    }
}

