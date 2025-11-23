"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession, signIn } from "next-auth/react"
import { initializeLiff, isInLiff, isLiffLoggedIn, getLiffProfile } from "@/lib/liff"

type LiffContextType = {
    isLiff: boolean
    isLoggedIn: boolean
    profile: {
        userId: string
        displayName: string
        pictureUrl?: string
        statusMessage?: string
    } | null
    isLoading: boolean
}

const LiffContext = createContext<LiffContextType>({
    isLiff: false,
    isLoggedIn: false,
    profile: null,
    isLoading: true,
})

export function useLiff() {
    return useContext(LiffContext)
}

export function LiffProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()
    const [isLiff, setIsLiff] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState<LiffContextType["profile"]>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function init() {
            try {
                // Initialize LIFF
                const initialized = await initializeLiff()

                if (initialized) {
                    const inLiff = isInLiff()
                    setIsLiff(inLiff)

                    if (inLiff) {
                        // If in LIFF browser
                        if (!isLiffLoggedIn()) {
                            // If not logged in to LIFF, trigger LIFF login
                            // This usually happens automatically in LINE app, but good for external browsers opening LIFF link
                            // window.liff.login() 
                            // We might not want to force login immediately for external browsers, but for LINE app yes.
                        } else {
                            setIsLoggedIn(true)
                            const userProfile = await getLiffProfile()
                            setProfile(userProfile)

                            // Auto-login to NextAuth if not already logged in
                            if (status === "unauthenticated") {
                                // We are logged into LINE (LIFF) but not NextAuth
                                // Trigger LINE login flow
                                // Use redirect: true to let NextAuth handle the OAuth dance
                                // LINE will detect existing login and redirect back immediately
                                signIn("line", { callbackUrl: window.location.href })
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("LIFF init error:", error)
            } finally {
                setIsLoading(false)
            }
        }

        // Only run init if session status is determined (to avoid premature auto-login)
        if (status !== "loading") {
            init()
        }
    }, [status])

    return (
        <LiffContext.Provider value={{ isLiff, isLoggedIn, profile, isLoading }}>
            {children}
        </LiffContext.Provider>
    )
}
