"use client"

// Manage Plan Page
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Trash2, Plus, Edit2, X } from "lucide-react"
import Link from "next/link"
import {
    getPlanById,
    manageStandardPlan,
    addPlanTask,
    updatePlanTask,
    deletePlanTask,
    getCropTypesWithVarieties,
} from "@/actions/admin-actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function ManagePlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [plan, setPlan] = useState<any>(null)
    const [cropTypes, setCropTypes] = useState<any[]>([])
    const [selectedVarietyIds, setSelectedVarietyIds] = useState<string[]>([])
    const [showVarietyEdit, setShowVarietyEdit] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    })
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        dayFromStart: 0,
        activityType: "",
    })

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            const [planData, types] = await Promise.all([
                getPlanById(id),
                getCropTypesWithVarieties(),
            ])

            if (planData) {
                setPlan(planData)
                setFormData({
                    name: planData.name,
                    description: planData.description || "",
                })
                setSelectedVarietyIds(planData.varieties.map((v: any) => v.cropVarietyId))
            }
            setCropTypes(types)
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setDataLoading(false)
        }
    }

    const handleUpdatePlan = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await manageStandardPlan("update", { id, ...formData })
            await loadData()
            alert("บันทึกการแก้ไขแล้ว")
        } catch (error) {
            console.error("Error updating plan:", error)
            alert("เกิดข้อผิดพลาดในการแก้ไขแผน")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateVarieties = async () => {
        if (selectedVarietyIds.length === 0) {
            alert("กรุณาเลือกพันธุ์พืชอย่างน้อย 1 รายการ")
            return
        }

        setLoading(true)
        try {
            await manageStandardPlan("update", {
                id,
                name: formData.name,
                description: formData.description,
                cropVarietyIds: selectedVarietyIds,
            })
            await loadData()
            setShowVarietyEdit(false)
            alert("อัพเดทพันธุ์พืชแล้ว")
        } catch (error) {
            console.error("Error updating varieties:", error)
            alert("เกิดข้อผิดพลาดในการอัพเดทพันธุ์พืช")
        } finally {
            setLoading(false)
        }
    }

    const handleDeletePlan = async () => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบแผนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
            return
        }

        setLoading(true)
        try {
            await manageStandardPlan("delete", { id })
            router.push("/admin/plans")
            router.refresh()
        } catch (error) {
            console.error("Error deleting plan:", error)
            alert("เกิดข้อผิดพลาดในการลบแผน")
        } finally {
            setLoading(false)
        }
    }

    const handleStartEdit = (task: any) => {
        setEditingTaskId(task.id)
        setTaskForm({
            title: task.title,
            description: task.description || "",
            dayFromStart: task.dayFromStart,
            activityType: task.activityType,
        })
        setShowTaskForm(true)
    }

    const handleCancelEdit = () => {
        setEditingTaskId(null)
        setShowTaskForm(false)
        setTaskForm({ title: "", description: "", dayFromStart: 0, activityType: "" })
    }

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingTaskId) {
                await updatePlanTask(editingTaskId, taskForm)
            } else {
                await addPlanTask(id, taskForm)
            }
            handleCancelEdit()
            await loadData()
        } catch (error) {
            console.error("Error saving task:", error)
            alert("เกิดข้อผิดพลาดในการบันทึกกิจกรรม")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
            return
        }

        setLoading(true)
        try {
            await deletePlanTask(taskId)
            await loadData()
        } catch (error) {
            console.error("Error deleting task:", error)
            alert("เกิดข้อผิดพลาดในการลบกิจกรรม")
        } finally {
            setLoading(false)
        }
    }

    const handleVarietyToggle = (varietyId: string) => {
        setSelectedVarietyIds((prev) =>
            prev.includes(varietyId)
                ? prev.filter((id) => id !== varietyId)
                : [...prev, varietyId]
        )
    }

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    if (!plan) {
        return <div>ไม่พบแผนนี้</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/plans">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">จัดการแผนการปลูก</h1>
                        <p className="text-muted-foreground">แผน: {plan.name}</p>
                    </div>
                </div>
                <Button variant="destructive" onClick={handleDeletePlan} disabled={loading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบแผน
                </Button>
            </div>

            {/* Plan Details */}
            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลแผน</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePlan} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อแผน *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">คำอธิบาย</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            บันทึกการแก้ไข
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Varieties */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>พันธุ์พืชที่ใช้แผนนี้</CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowVarietyEdit(!showVarietyEdit)}
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            แก้ไข
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!showVarietyEdit ? (
                        <div className="flex flex-wrap gap-2">
                            {plan.varieties.length === 0 ? (
                                <p className="text-muted-foreground">ไม่มีพันธุ์พืชที่เลือก</p>
                            ) : (
                                plan.varieties.map((pv: any) => (
                                    <Badge key={pv.id} variant="secondary">
                                        {pv.cropVariety.cropType.nameTh || pv.cropVariety.cropType.name} -
                                        {pv.cropVariety.nameTh || pv.cropVariety.name}
                                    </Badge>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-4">
                                {cropTypes.map((type) => (
                                    <div key={type.id} className="space-y-2">
                                        <h3 className="font-semibold text-sm">{type.nameTh || type.name}</h3>
                                        <div className="space-y-2 ml-2">
                                            {type.varieties.map((variety: any) => (
                                                <div key={variety.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`edit-${variety.id}`}
                                                        checked={selectedVarietyIds.includes(variety.id)}
                                                        onCheckedChange={() => handleVarietyToggle(variety.id)}
                                                    />
                                                    <label htmlFor={`edit-${variety.id}`} className="text-sm cursor-pointer">
                                                        {variety.nameTh || variety.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleUpdateVarieties} disabled={loading}>
                                    บันทึกการเปลี่ยนแปลง
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setShowVarietyEdit(false)
                                    setSelectedVarietyIds(plan.varieties.map((v: any) => v.cropVarietyId))
                                }}>
                                    ยกเลิก
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Activities - same as before */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>กิจกรรมแนะนำ</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                กิจกรรมที่แนะนำให้ทำในแต่ละช่วงเวลา
                            </p>
                        </div>
                        {!showTaskForm && (
                            <Button
                                onClick={() => setShowTaskForm(true)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                เพิ่มกิจกรรม
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showTaskForm && (
                        <form onSubmit={handleSubmitTask} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">{editingTaskId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</h3>
                                <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="title">ชื่อกิจกรรม *</Label>
                                    <Input
                                        id="title"
                                        required
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                        placeholder="เช่น ใส่ปุ๋ยเคมี"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dayFromStart">วันที่ (นับจากวันเริ่ม) *</Label>
                                    <Input
                                        id="dayFromStart"
                                        type="number"
                                        required
                                        value={taskForm.dayFromStart}
                                        onChange={(e) =>
                                            setTaskForm({ ...taskForm, dayFromStart: parseInt(e.target.value) || 0 })
                                        }
                                        min={0}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="activityType">ประเภทกิจกรรม *</Label>
                                <Input
                                    id="activityType"
                                    required
                                    value={taskForm.activityType}
                                    onChange={(e) => setTaskForm({ ...taskForm, activityType: e.target.value })}
                                    placeholder="เช่น ใส่ปุ๋ย, รดน้ำ, กำจัดวัชพืช"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taskDescription">คำอธิบาย</Label>
                                <Textarea
                                    id="taskDescription"
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    rows={2}
                                    placeholder="รายละเอียดเพิ่มเติม..."
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" size="sm" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {editingTaskId ? "บันทึกการแก้ไข" : "เพิ่มกิจกรรม"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                >
                                    ยกเลิก
                                </Button>
                            </div>
                        </form>
                    )}

                    {plan.tasks.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            ยังไม่มีกิจกรรม คลิก "เพิ่มกิจกรรม" เพื่อเริ่มต้น
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {plan.tasks.map((task: any) => (
                                <div
                                    key={task.id}
                                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">วันที่ {task.dayFromStart}</Badge>
                                            <Badge className="bg-green-600">{task.activityType}</Badge>
                                            <span className="font-medium">{task.title}</span>
                                        </div>
                                        {task.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleStartEdit(task)}
                                            disabled={loading}
                                        >
                                            <Edit2 className="w-4 h-4 text-blue-600" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteTask(task.id)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
