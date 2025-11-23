"use client"

import { useState } from "react"
import { addActivity } from "@/actions/activity-actions"
import { ActivityType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const activityTypes = [
    { value: "SOIL_PREPARATION", label: "เตรียมดิน", icon: "🚜" },
    { value: "PLANTING", label: "ปลูก", icon: "🌱" },
    { value: "FERTILIZING", label: "ใส่ปุ๋ย", icon: "💧" },
    { value: "PEST_CONTROL", label: "กำจัดศัตรูพืช", icon: "🐛" },
    { value: "IRRIGATION", label: "รดน้ำ", icon: "💦" },
    { value: "WEEDING", label: "กำจัดวัชพืช", icon: "🌿" },
    { value: "HARVESTING", label: "เก็บเกี่ยว", icon: "🌾" },
    { value: "OTHER", label: "อื่นๆ", icon: "📋" },
]

export default function ActivityForm({
    cycleId,
    plotId,
}: {
    cycleId: string
    plotId: string
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])

    const [formData, setFormData] = useState({
        type: "" as ActivityType,
        description: "",
        activityDate: new Date().toISOString().split("T")[0],
        cost: "",
        income: "",
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploadingImages(true)

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData()
                formData.append("file", file)

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error("Upload failed")
                }

                const data = await response.json()
                return data.url
            })

            const urls = await Promise.all(uploadPromises)
            setUploadedImages((prev) => [...prev, ...urls])
        } catch (error) {
            console.error("Upload error:", error)
            alert("การอัพโหลดรูปภาพล้มเหลว กรุณาลองใหม่อีกครั้ง")
        } finally {
            setUploadingImages(false)
        }
    }

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.type) {
            alert("กรุณาเลือกประเภทกิจกรรม")
            return
        }

        setLoading(true)

        try {
            await addActivity(
                cycleId,
                {
                    type: formData.type,
                    description: formData.description,
                    activityDate: new Date(formData.activityDate),
                    cost: parseFloat(formData.cost) || 0,
                    income: parseFloat(formData.income) || 0,
                },
                uploadedImages
            )

            router.push(`/plots/${plotId}`)
            router.refresh()
        } catch (error) {
            console.error("Error adding activity:", error)
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>บันทึกกิจกรรมใหม่</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Activity Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">ประเภทกิจกรรม *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, type: value as ActivityType })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภทกิจกรรม" />
                            </SelectTrigger>
                            <SelectContent>
                                {activityTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{type.icon}</span>
                                            <span>{type.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">วันที่ทำกิจกรรม *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.activityDate}
                            onChange={(e) =>
                                setFormData({ ...formData, activityDate: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">รายละเอียด *</Label>
                        <Textarea
                            id="description"
                            placeholder="อธิบายกิจกรรมที่ทำ..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                            required
                        />
                    </div>

                    {/* Cost and Income */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cost">ค่าใช้จ่าย (บาท)</Label>
                            <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.cost}
                                onChange={(e) =>
                                    setFormData({ ...formData, cost: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="income">รายได้ (บาท)</Label>
                            <Input
                                id="income"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.income}
                                onChange={(e) =>
                                    setFormData({ ...formData, income: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>รูปภาพกิจกรรม</Label>
                        <div className="border-2 border-dashed rounded-lg p-6">
                            <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground text-center">
                                    คลิกเพื่ออัพโหลดรูปภาพ
                                    <br />
                                    (สูงสุด 5MB ต่อรูป)
                                </p>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploadingImages}
                                    className="max-w-xs"
                                />
                            </div>

                            {uploadingImages && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>กำลังอัพโหลด...</span>
                                </div>
                            )}

                            {/* Preview uploaded images */}
                            {uploadedImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {uploadedImages.map((url, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                                        >
                                            <Image
                                                src={url}
                                                alt={`อัพโหลด ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1"
                            disabled={loading}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading || uploadingImages}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                "บันทึกกิจกรรม"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
