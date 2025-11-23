import { auth } from "@/auth"
import { getPlotsByUser } from "@/actions/plot-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Sprout, MapPin, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()
    const plots = await getPlotsByUser()

    const activePlots = plots.filter(p => p.plantingCycles.some(c => c.status === "ACTIVE"))

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-green-400 flex items-center justify-center text-2xl font-bold">
                            {session?.user?.name?.charAt(0) || "U"}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold mb-1">สวัสดี, {session?.user?.name || "เกษตรกร"}! 👋</h2>
                        <p className="opacity-90">วันนี้อากาศดี เหมาะแก่การดูแลพืชผลของคุณ</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Sprout className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{activePlots.length}</div>
                            <div className="text-xs text-muted-foreground">แปลงที่ปลูกอยู่</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{plots.length}</div>
                            <div className="text-xs text-muted-foreground">แปลงทั้งหมด</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Plots Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">แปลงที่กำลังปลูก 🌱</h3>
                    <Link href="/plots" className="text-sm text-green-600 hover:underline flex items-center">
                        ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {activePlots.length > 0 ? (
                    <div className="grid gap-4">
                        {activePlots.map((plot) => {
                            const activeCycle = plot.plantingCycles.find(c => c.status === "ACTIVE")
                            const daysElapsed = activeCycle ? Math.floor((new Date().getTime() - new Date(activeCycle.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
                            const estimatedDuration = 120 // Default 120 days, can be from standardPlan
                            const progress = Math.min((daysElapsed / estimatedDuration) * 100, 100)
                            const totalRai = (plot.sizeRai || 0) + (plot.sizeNgan || 0) / 4 + (plot.sizeWa || 0) / 400

                            return (
                                <Link key={plot.id} href={`/plots/${plot.id}`}>
                                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold">{plot.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{activeCycle?.cropVariety.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">📏 {totalRai.toFixed(2)} ไร่</p>
                                                </div>
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    กำลังปลูก
                                                </span>
                                            </div>

                                            {/* Growth Progress Bar */}
                                            <div className="space-y-1 mb-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>ความคืบหน้า</span>
                                                    <span>{daysElapsed} วัน ({progress.toFixed(0)}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                เริ่มปลูก: {new Date(activeCycle!.startDate).toLocaleDateString("th-TH")}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                <Sprout className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium">ยังไม่มีการปลูกในขณะนี้</p>
                                <p className="text-sm text-muted-foreground">เริ่มรอบการปลูกใหม่ได้เลย</p>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/plots">ไปที่จัดการแปลง</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

        </div>
    )
}

function User({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
