"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"

/**
 * Get user profile with linked accounts
 */
export async function getUserProfile() {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                accounts: {
                    select: {
                        id: true,
                        provider: true,
                        type: true,
                    },
                },
            },
        })

        if (!user) {
            throw new Error("User not found")
        }

        // Don't send password hash to client
        const { password, ...safeUser } = user
        return safeUser
    } catch (error) {
        console.error("Error fetching user profile:", error)
        throw new Error("Failed to fetch user profile")
    }
}

/**
 * Update user basic profile (name, image)
 */
export async function updateProfile(data: { name?: string; image?: string }) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                image: data.image,
            },
        })

        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Error updating profile:", error)
        throw new Error("Failed to update profile")
    }
}

/**
 * Set or update username
 */
export async function setUsername(username: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Basic validation
    if (username.length < 3) {
        throw new Error("Username must be at least 3 characters long")
    }

    try {
        // Check uniqueness
        const existingUser = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUser && existingUser.id !== session.user.id) {
            throw new Error("Username is already taken")
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { username },
        })

        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Error setting username:", error)
        if (error instanceof Error) throw error
        throw new Error("Failed to set username")
    }
}

/**
 * Set or update password
 */
export async function setPassword(password: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
    }

    try {
        const hashedPassword = await hash(password, 12)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        })

        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Error setting password:", error)
        throw new Error("Failed to set password")
    }
}

/**
 * Unlink a social account
 */
export async function unlinkAccount(provider: string) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        // Check if user has password or other linked accounts
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                accounts: true,
            },
        })

        if (!user) throw new Error("User not found")

        const hasPassword = !!user.password
        const accountCount = user.accounts.length

        // Prevent unlinking if it's the only login method
        if (!hasPassword && accountCount <= 1) {
            throw new Error("Cannot unlink the only login method. Please set a password or link another account first.")
        }

        await prisma.account.deleteMany({
            where: {
                userId: session.user.id,
                provider: provider,
            },
        })

        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Error unlinking account:", error)
        if (error instanceof Error) throw error
        throw new Error("Failed to unlink account")
    }
}
