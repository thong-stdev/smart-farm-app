import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Map, Sprout, FileText, LogOut, Home } from "lucide-react"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Only ADMIN can access
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const navItems = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/admin/map",
            label: "แผนที่ภาพรวม",
            icon: Map,
        },
        {
            href: "/admin/crops",
            label: "จัดการพืช",
            icon: Sprout,
        },
        {
            href: "/admin/plans",
            label: "แผนการปลูก",
            icon: FileText,
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Admin Panel</h1>
                            <p className="text-xs text-muted-foreground">Smart Farm Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <form action="/api/auth/signout" method="POST">
                            <button
                                type="submit"
                                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">ออกจากระบบ</span>
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="space-y-2">
                        <nav className="bg-white rounded-lg border p-2 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main>{children}</main>
                </div>
            </div>
        </div>
    )
}
