"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { manageCropType, getCropTypeById } from "@/actions/admin-actions"

export default function EditCropTypePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const cropType = await getCropTypeById(id)
                if (cropType) {
                    setFormData({
                        name: cropType.nameTh || cropType.name,
                        description: cropType.description || "",
                    })
                }
            } catch (error) {
                console.error("Error loading crop type:", error)
            } finally {
                setDataLoading(false)
            }
        }
        loadData()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await manageCropType("update", { id, ...formData })
            router.push("/admin/crops")
            router.refresh()
        } catch (error) {
            console.error("Error updating crop type:", error)
            alert("เกิดข้อผิดพลาดในการแก้ไขประเภทพืช")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประเภทพืชนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
            return
        }

        setLoading(true)
        try {
            await manageCropType("delete", { id })
            router.push("/admin/crops")
            router.refresh()
        } catch (error: any) {
            console.error("Error deleting crop type:", error)
            alert(error.message || "ไม่สามารถลบได้ อาจมีพันธุ์พืชที่เชื่อมโยงอยู่")
        } finally {
            setLoading(false)
        }
    }

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/crops">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">แก้ไขประเภทพืช</h1>
                        <p className="text-muted-foreground">แก้ไขข้อมูลประเภทพืช</p>
                    </div>
                </div>
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลประเภทพืช</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อประเภทพืช *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="เช่น อ้อย"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">คำอธิบาย</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="รายละเอียดเกี่ยวกับประเภทพืชนี้..."
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    "บันทึกการแก้ไข"
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                                ยกเลิก
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
