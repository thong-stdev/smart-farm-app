"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            })

            if (result?.ok) {
                // Fetch session to check role
                const response = await fetch("/api/auth/session")
                const session = await response.json()

                // Redirect based on role
                if (session?.user?.role === "ADMIN") {
                    window.location.href = "/admin"
                } else {
                    window.location.href = "/dashboard"
                }
            } else {
                alert("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน")
            }
        } catch (error) {
            console.error("Login failed:", error)
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = (provider: string) => {
        setLoading(true)
        // Don't specify callbackUrl, let the system handle it
        signIn(provider)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-green-200">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-3xl">🌾</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-800">Smart Farm</CardTitle>
                    <CardDescription>เข้าสู่ระบบเพื่อจัดการฟาร์มของคุณ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        <Button
                            variant="outline"
                            className="w-full bg-[#00C300] hover:bg-[#00B300] text-white border-none h-11"
                            onClick={() => handleSocialLogin("line")}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                <span className="font-bold text-lg mr-2">LINE</span>
                            )}
                            เข้าสู่ระบบด้วย LINE
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => handleSocialLogin("google")}
                                disabled={loading}
                            >
                                Google
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => handleSocialLogin("facebook")}
                                disabled={loading}
                            >
                                Facebook
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                หรือเข้าสู่ระบบด้วยรหัสผ่าน
                            </span>
                        </div>
                    </div>

                    {/* Credentials Form */}
                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">ชื่อผู้ใช้</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            เข้าสู่ระบบ
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center text-xs text-muted-foreground">
                    ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบ
                </CardFooter>
            </Card>
        </div>
    )
}
