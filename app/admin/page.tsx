import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Sprout, MapPin, FileText } from "lucide-react"

async function getAdminStats() {
    const [totalUsers, totalPlots, activeCycles, cropTypes, varieties, standardPlans] = await Promise.all([
        prisma.user.count(),
        prisma.plot.count(),
        prisma.plantingCycle.count({ where: { status: "ACTIVE" } }),
        prisma.cropType.count(),
        prisma.cropVariety.count(),
        prisma.standardPlan.count(),
    ])

    return {
        totalUsers,
        totalPlots,
        activeCycles,
        cropTypes,
        varieties,
        standardPlans,
    }
}

export default async function AdminDashboardPage() {
    const stats = await getAdminStats()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">ภาพรวมของระบบทั้งหมด</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ผู้ใช้ทั้งหมด
                        </CardTitle>
                        <Users className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            users in system
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            แปลงทั้งหมด
                        </CardTitle>
                        <MapPin className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalPlots}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            registered plots
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            กำลังปลูก
                        </CardTitle>
                        <Sprout className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.activeCycles}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            active planting cycles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ประเภทพืช
                        </CardTitle>
                        <Sprout className="w-4 h-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.cropTypes}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            crop types available
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            พันธุ์พืช
                        </CardTitle>
                        <Sprout className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.varieties}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            varieties registered
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            แผนการปลูก
                        </CardTitle>
                        <FileText className="w-4 h-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.standardPlans}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            standard planting plans
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>เมนูด่วน</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <a
                        href="/admin/map"
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <div className="text-sm font-medium">แผนที่</div>
                    </a>
                    <a
                        href="/admin/crops"
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                        <Sprout className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <div className="text-sm font-medium">จัดการพืช</div>
                    </a>
                    <a
                        href="/admin/plans"
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                        <FileText className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                        <div className="text-sm font-medium">แผนการปลูก</div>
                    </a>
                    <a
                        href="/dashboard"
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-medium">หน้าผู้ใช้</div>
                    </a>
                </CardContent>
            </Card>
        </div>
    )
}
