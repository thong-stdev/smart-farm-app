import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminMapClient from "@/components/admin/AdminMapClient"

async function getAllPlotsWithDetails() {
    return await prisma.plot.findMany({
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
                take: 1,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })
}

export default async function AdminMapPage() {
    const plots = await getAllPlotsWithDetails()

    const plotsForMap = plots.map((plot) => ({
        id: plot.id,
        name: plot.name,
        latitude: plot.latitude,
        longitude: plot.longitude,
        sizeRai: plot.sizeRai || 0,
        sizeNgan: plot.sizeNgan || 0,
        sizeWa: plot.sizeWa || 0,
        owner: plot.user.name || plot.user.email || "Unknown",
        activeCycle: plot.plantingCycles[0]
            ? {
                cropName: plot.plantingCycles[0].cropVariety.nameTh || plot.plantingCycles[0].cropVariety.name,
                cropType: plot.plantingCycles[0].cropVariety.cropType.nameTh || plot.plantingCycles[0].cropVariety.cropType.name,
                startDate: plot.plantingCycles[0].startDate.toISOString(),
            }
            : null,
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">แผนที่ภาพรวม</h1>
                <p className="text-muted-foreground">แสดงตำแหน่งแปลงเกษตรทั้งหมดในระบบ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">แปลงทั้งหมด</div>
                        <div className="text-2xl font-bold">{plots.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">กำลังปลูก</div>
                        <div className="text-2xl font-bold text-green-600">
                            {plots.filter((p) => p.plantingCycles.length > 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">ว่าง</div>
                        <div className="text-2xl font-bold text-gray-600">
                            {plots.filter((p) => p.plantingCycles.length === 0).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">เจ้าของ</div>
                        <div className="text-2xl font-bold">
                            {new Set(plots.map((p) => p.user.id)).size}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>แผนที่แสดงพื้นที่เพาะปลูก</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminMapClient plots={plotsForMap} />
                </CardContent>
            </Card>
        </div>
    )
}
