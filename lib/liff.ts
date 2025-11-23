"use client"

/**
 * LINE LIFF (LINE Frontend Framework) Utilities
 * This module handles LINE LIFF SDK integration for the mobile app
 */

// Type definitions for LIFF
declare global {
    interface Window {
        liff: any
    }
}

/**
 * Initialize LIFF SDK
 */
export async function initializeLiff(): Promise<boolean> {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID

    if (!liffId) {
        console.warn("LIFF ID not configured")
        return false
    }

    try {
        // Check if LIFF is available
        if (typeof window === "undefined" || !window.liff) {
            console.warn("LIFF SDK not loaded")
            return false
        }

        await window.liff.init({ liffId })
        return true
    } catch (error) {
        console.error("LIFF initialization failed:", error)
        return false
    }
}

/**
 * Check if app is running in LINE LIFF browser
 */
export function isInLiff(): boolean {
    if (typeof window === "undefined") return false
    return window.liff?.isInClient() || false
}

/**
 * Check if user is logged in via LIFF
 */
export function isLiffLoggedIn(): boolean {
    if (typeof window === "undefined" || !window.liff) return false
    return window.liff.isLoggedIn()
}

/**
 * Get LIFF user profile
 */
export async function getLiffProfile() {
    try {
        if (!window.liff || !window.liff.isLoggedIn()) {
            return null
        }

        const profile = await window.liff.getProfile()
        return {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            statusMessage: profile.statusMessage,
        }
    } catch (error) {
        console.error("Failed to get LIFF profile:", error)
        return null
    }
}

/**
 * Login via LIFF
 */
export function liffLogin() {
    if (typeof window !== "undefined" && window.liff) {
        window.liff.login()
    }
}

/**
 * Logout from LIFF
 */
export function liffLogout() {
    if (typeof window !== "undefined" && window.liff) {
        window.liff.logout()
    }
}

/**
 * Get LIFF access token (for backend authentication)
 */
export function getLiffAccessToken(): string | null {
    if (typeof window === "undefined" || !window.liff) return null
    return window.liff.getAccessToken() || null
}

/**
 * Close LIFF window
 */
export function closeLiff() {
    if (typeof window !== "undefined" && window.liff) {
        window.liff.closeWindow()
    }
}

/**
 * Open external URL in external browser
 */
export function openExternalUrl(url: string) {
    if (typeof window !== "undefined" && window.liff) {
        window.liff.openWindow({
            url,
            external: true,
        })
    } else {
        window.open(url, "_blank")
    }
}

/**
 * Send message to LINE chat
 */
export async function sendLiffMessage(text: string) {
    try {
        if (!window.liff) return false

        await window.liff.sendMessages([
            {
                type: "text",
                text,
            },
        ])
        return true
    } catch (error) {
        console.error("Failed to send LIFF message:", error)
        return false
    }
}

/**
 * Share target picker (share to LINE chat)
 */
export async function shareLiff(message: string) {
    try {
        if (!window.liff) return false

        const result = await window.liff.shareTargetPicker([
            {
                type: "text",
                text: message,
            },
        ])

        return result
    } catch (error) {
        console.error("Failed to share via LIFF:", error)
        return false
    }
}
