import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Protected admin routes
    if (pathname.startsWith("/admin")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
        if (session.user.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    // Protected user routes
    if (pathname.startsWith("/plots") || pathname.startsWith("/dashboard")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    // Redirect authenticated users away from login page
    if (pathname.startsWith("/login")) {
        if (session) {
            if (session.user.role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin", request.url))
            }
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*", "/plots/:path*", "/dashboard/:path*", "/login"],
    runtime: "nodejs",
}
