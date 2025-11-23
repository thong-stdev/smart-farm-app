"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, Lock, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react"
import { getUserProfile, updateProfile, setUsername, setPassword, unlinkAccount } from "@/actions/profile-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Form states
    const [name, setName] = useState("")
    const [username, setUsernameInput] = useState("")
    const [password, setPasswordInput] = useState("")

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const profile = await getUserProfile()
            setUser(profile)
            setName(profile.name || "")
            setUsernameInput(profile.username || "")
        } catch (error) {
            console.error("Error loading profile:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading(true)
        setMessage(null)
        try {
            await updateProfile({ name })
            await updateSession({ name })
            setMessage({ type: "success", text: "อัพเดทข้อมูลส่วนตัวสำเร็จ" })
        } catch (error) {
            setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" })
        } finally {
            setActionLoading(false)
        }
    }

    const handleSetUsername = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading(true)
        setMessage(null)
        try {
            await setUsername(username)
            await loadProfile()
            setMessage({ type: "success", text: "ตั้งค่า Username สำเร็จ" })
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "เกิดข้อผิดพลาด" })
        } finally {
            setActionLoading(false)
        }
    }

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading(true)
        setMessage(null)
        try {
            await setPassword(password)
            setPasswordInput("")
            await loadProfile()
            setMessage({ type: "success", text: "ตั้งค่ารหัสผ่านสำเร็จ" })
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "เกิดข้อผิดพลาด" })
        } finally {
            setActionLoading(false)
        }
    }

    const handleLinkAccount = (provider: string) => {
        signIn(provider, { callbackUrl: "/profile" })
    }

    const handleUnlinkAccount = async (provider: string) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเชื่อมต่อกับ ${provider}?`)) return

        setActionLoading(true)
        setMessage(null)
        try {
            await unlinkAccount(provider)
            await loadProfile()
            setMessage({ type: "success", text: `ยกเลิกการเชื่อมต่อ ${provider} สำเร็จ` })
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "ไม่สามารถยกเลิกการเชื่อมต่อได้" })
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    const isLinked = (provider: string) => {
        return user?.accounts?.some((acc: any) => acc.provider === provider)
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">การตั้งค่าบัญชี</h1>

            {message && (
                <Alert variant={message.type === "success" ? "default" : "destructive"} className={message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}>
                    {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{message.type === "success" ? "สำเร็จ" : "ข้อผิดพลาด"}</AlertTitle>
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={user?.image || ""} />
                                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                {/* Image upload could go here later */}
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">ชื่อที่แสดง</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={actionLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">อีเมล</Label>
                                    <Input id="email" value={user?.email || ""} disabled className="bg-gray-100" />
                                </div>
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={actionLoading}>
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกข้อมูล"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Security & Social */}
                <div className="md:col-span-2 space-y-6">
                    {/* Credentials Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                รหัสผ่านและการเข้าสู่ระบบ
                            </CardTitle>
                            <CardDescription>จัดการ Username และรหัสผ่านสำหรับการเข้าสู่ระบบแบบปกติ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSetUsername} className="space-y-4 border-b pb-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsernameInput(e.target.value)}
                                            placeholder="ตั้งชื่อผู้ใช้..."
                                            disabled={actionLoading}
                                        />
                                        <Button type="submit" variant="outline" disabled={actionLoading}>
                                            บันทึก
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">ใช้สำหรับเข้าสู่ระบบแทนอีเมล</p>
                                </div>
                            </form>

                            <form onSubmit={handleSetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {user?.password ? "เปลี่ยนรหัสผ่าน" : "ตั้งรหัสผ่านใหม่"}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                                            disabled={actionLoading}
                                        />
                                        <Button type="submit" variant="outline" disabled={actionLoading || password.length < 6}>
                                            บันทึก
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Social Accounts Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="w-5 h-5" />
                                บัญชีที่เชื่อมต่อ
                            </CardTitle>
                            <CardDescription>เชื่อมต่อบัญชี Social Media เพื่อการเข้าสู่ระบบที่สะดวกขึ้น</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* LINE */}
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#00C300] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        LINE
                                    </div>
                                    <div>
                                        <p className="font-medium">LINE</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isLinked("line") ? "เชื่อมต่อแล้ว" : "ยังไม่เชื่อมต่อ"}
                                        </p>
                                    </div>
                                </div>
                                {isLinked("line") ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleUnlinkAccount("line")}
                                        disabled={actionLoading}
                                    >
                                        ยกเลิกการเชื่อมต่อ
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => handleLinkAccount("line")}>
                                        เชื่อมต่อ
                                    </Button>
                                )}
                            </div>

                            {/* Facebook */}
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        FB
                                    </div>
                                    <div>
                                        <p className="font-medium">Facebook</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isLinked("facebook") ? "เชื่อมต่อแล้ว" : "ยังไม่เชื่อมต่อ"}
                                        </p>
                                    </div>
                                </div>
                                {isLinked("facebook") ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleUnlinkAccount("facebook")}
                                        disabled={actionLoading}
                                    >
                                        ยกเลิกการเชื่อมต่อ
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => handleLinkAccount("facebook")}>
                                        เชื่อมต่อ
                                    </Button>
                                )}
                            </div>

                            {/* Google */}
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white border rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                        G
                                    </div>
                                    <div>
                                        <p className="font-medium">Google</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isLinked("google") ? "เชื่อมต่อแล้ว" : "ยังไม่เชื่อมต่อ"}
                                        </p>
                                    </div>
                                </div>
                                {isLinked("google") ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleUnlinkAccount("google")}
                                        disabled={actionLoading}
                                    >
                                        ยกเลิกการเชื่อมต่อ
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => handleLinkAccount("google")}>
                                        เชื่อมต่อ
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
