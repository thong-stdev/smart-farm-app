import { auth } from "@/auth"
import { getPlotsByUser } from "@/actions/plot-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, MapPin, Sprout, ChevronRight } from "lucide-react"

export default async function PlotsPage() {
    const plots = await getPlotsByUser()

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">แปลงเกษตรของฉัน</h1>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <Link href="/plots/new">
                        <Plus className="w-4 h-4 mr-1" />
                        สร้างแปลง
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {plots.length > 0 ? (
                    plots.map((plot) => {
                        const activeCycle = plot.plantingCycles.find(c => c.status === "ACTIVE")

                        return (
                            <Link key={plot.id} href={`/plots/${plot.id}`}>
                                <Card className="hover:border-green-500 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                {plot.name}
                                                {activeCycle && (
                                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">
                                                        กำลังปลูก
                                                    </span>
                                                )}
                                            </h3>

                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {plot.sizeRai ? `${plot.sizeRai} ไร่ ` : ""}
                                                {plot.sizeNgan ? `${plot.sizeNgan} งาน ` : ""}
                                                {plot.sizeWa ? `${plot.sizeWa} ตร.ว.` : ""}
                                                {(!plot.sizeRai && !plot.sizeNgan && !plot.sizeWa) && "ไม่ระบุขนาด"}
                                            </div>

                                            {activeCycle ? (
                                                <div className="text-sm text-green-600 flex items-center gap-1 mt-2">
                                                    <Sprout className="w-3 h-3" />
                                                    {activeCycle.cropVariety.name}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    ว่าง (พร้อมปลูก)
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีแปลงเกษตร</h3>
                        <p className="text-muted-foreground mb-6">เริ่มสร้างแปลงแรกของคุณเพื่อเริ่มบันทึกการปลูก</p>
                        <Button asChild>
                            <Link href="/plots/new">สร้างแปลงใหม่</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
