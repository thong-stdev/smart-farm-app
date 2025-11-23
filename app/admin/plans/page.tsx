import prisma from "@/lib/prisma"
// Plans page
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

async function getAllPlans() {
    return await prisma.standardPlan.findMany({
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
            tasks: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })
}

export default async function PlansPage() {
    const plans = await getAllPlans()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">แผนการปลูกมาตรฐาน</h1>
                    <p className="text-muted-foreground">จัดการแผนการปลูกและกิจกรรมแนะนำ</p>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/admin/plans/new">
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มแผนใหม่
                    </Link>
                </Button>
            </div>

            {plans.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">ยังไม่มีแผนการปลูกในระบบ</p>
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href="/admin/plans/new">
                                <Plus className="w-4 h-4 mr-2" />
                                สร้างแผนแรก
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                                        <div className="mt-2 space-y-1">
                                            {plan.varieties.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">ไม่มีพันธุ์พืชที่เลือก</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {plan.varieties.map((pv) => (
                                                        <Badge key={pv.id} variant="outline" className="text-xs">
                                                            {pv.cropVariety.cropType.nameTh || pv.cropVariety.cropType.name}:
                                                            {pv.cropVariety.nameTh || pv.cropVariety.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                                        {plan.tasks.length} กิจกรรม
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {plan.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {plan.description}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                        <Link href={`/admin/plans/${plan.id}`}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            จัดการ
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
