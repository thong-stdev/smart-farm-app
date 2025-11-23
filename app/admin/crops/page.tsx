import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getCropTypesWithVarieties() {
    return await prisma.cropType.findMany({
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
}

export default async function AdminCropsPage() {
    const cropTypes = await getCropTypesWithVarieties()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">จัดการประเภทพืช และพันธุ์พืช</h1>
                    <p className="text-muted-foreground">
                        เพิ่ม แก้ไข หรือลบประเภทพืชและพันธุ์พืชในระบบ
                    </p>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/admin/crops/new">
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มประเภทพืช
                    </Link>
                </Button>
            </div>

            {cropTypes.length > 0 ? (
                <div className="grid gap-4">
                    {cropTypes.map((cropType) => (
                        <Card key={cropType.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {cropType.nameTh || cropType.name}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                ({cropType.name})
                                            </span>
                                        </CardTitle>
                                        {cropType.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {cropType.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/crops/${cropType.id}/varieties/new`}>
                                                <Plus className="w-3 h-3 mr-1" />
                                                เพิ่มพันธุ์
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/crops/${cropType.id}/edit`}>แก้ไข</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {cropType.varieties.length > 0 ? (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-muted-foreground mb-2">
                                            พันธุ์ ({cropType.varieties.length})
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {cropType.varieties.map((variety) => (
                                                <div
                                                    key={variety.id}
                                                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">
                                                                {variety.nameTh || variety.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {variety.name}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                            className="ml-2 h-6 px-2 text-xs"
                                                        >
                                                            <Link href={`/admin/crops/varieties/${variety.id}/edit`}>
                                                                แก้ไข
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground text-sm">
                                        ยังไม่มีพันธุ์ในประเภทนี้
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Plus className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีประเภทพืช</h3>
                        <p className="text-muted-foreground mb-6">
                            เริ่มต้นโดยการเพิ่มประเภทพืชในระบบ
                        </p>
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href="/admin/crops/new">
                                <Plus className="w-4 h-4 mr-2" />
                                เพิ่มประเภทพืช
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
