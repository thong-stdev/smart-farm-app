"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Sprout, ClipboardList, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const navItems = [
        {
            href: "/dashboard",
            label: "หน้าหลัก",
            icon: Home,
        },
        {
            href: "/plots",
            label: "แปลงเกษตร",
            icon: Sprout,
        },
        {
            href: "/summary",
            label: "สรุปผล",
            icon: ClipboardList,
        },
        {
            href: "/profile",
            label: "โปรไฟล์",
            icon: User,
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
                <h1 className="font-bold text-lg text-green-700 flex items-center gap-2">
                    <span className="text-2xl">🌾</span> Smart Farm
                </h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-muted-foreground hover:text-red-500"
                >
                    <LogOut className="w-5 h-5" />
                </Button>
            </header>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Bottom Navigation (Mobile First) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1",
                                    isActive
                                        ? "text-green-600 font-medium"
                                        : "text-muted-foreground hover:text-green-600 transition-colors"
                                )}
                            >
                                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                                <span className="text-[10px]">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
