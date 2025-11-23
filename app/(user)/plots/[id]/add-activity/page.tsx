import { notFound } from "next/navigation"
import { getPlotWithActiveCycle } from "@/actions/plot-actions"
import ActivityForm from "@/components/activity-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AddActivityPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const plot = await getPlotWithActiveCycle(id)

    if (!plot) {
        notFound()
    }

    const activeCycle = plot.plantingCycles[0]

    if (!activeCycle) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-4">ไม่พบรอบการปลูกที่ Active</h1>
                    <p className="text-muted-foreground mb-6">
                        กรุณาเริ่มรอบการปลูกใหม่ก่อนบันทึกกิจกรรม
                    </p>
                    <Link
                        href={`/plots/${id}`}
                        className="text-primary hover:underline"
                    >
                        กลับไปหน้าแปลง
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
            <Link
                href={`/plots/${id}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                กลับไปหน้าแปลง {plot.name}
            </Link>

            <ActivityForm cycleId={activeCycle.id} plotId={id} />
        </div>
    )
}
