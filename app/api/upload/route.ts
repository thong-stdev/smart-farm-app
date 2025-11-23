import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get form data
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            )
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'smart-farm/activities',
                    resource_type: 'image',
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' }, // Resize if larger
                        { quality: 'auto' }, // Auto quality
                        { fetch_format: 'auto' }, // Auto format
                    ],
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )

            uploadStream.end(buffer)
        })

        return NextResponse.json({
            success: true,
            url: (result as any).secure_url,
            publicId: (result as any).public_id,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        )
    }
}

// DELETE endpoint to remove image from Cloudinary
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { publicId } = await request.json()

        if (!publicId) {
            return NextResponse.json(
                { error: 'No public ID provided' },
                { status: 400 }
            )
        }

        await cloudinary.uploader.destroy(publicId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: 'Delete failed' },
            { status: 500 }
        )
    }
}
