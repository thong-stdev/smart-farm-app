"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

interface MapPickerProps {
    initialLat?: number
    initialLng?: number
    onLocationSelect: (lat: number, lng: number) => void
    height?: string
}

export default function MapPicker({
    initialLat = 13.7563, // Default: Bangkok
    initialLng = 100.5018,
    onLocationSelect,
    height = "400px",
}: MapPickerProps) {
    const mapRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient) return

        // Initialize map only once
        if (!mapRef.current) {
            const map = L.map("map-container").setView([initialLat, initialLng], 13)

            // Add OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map)

            // Add initial marker
            const marker = L.marker([initialLat, initialLng], {
                draggable: true,
            }).addTo(map)

            // Handle marker drag
            marker.on("dragend", () => {
                const position = marker.getLatLng()
                onLocationSelect(position.lat, position.lng)
            })

            // Handle map click
            map.on("click", (e: L.LeafletMouseEvent) => {
                marker.setLatLng(e.latlng)
                onLocationSelect(e.latlng.lat, e.latlng.lng)
            })

            mapRef.current = map
            markerRef.current = marker

            // Get user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords
                        map.setView([latitude, longitude], 15)
                        marker.setLatLng([latitude, longitude])
                        onLocationSelect(latitude, longitude)
                    },
                    (error) => {
                        console.log("Geolocation error:", error)
                    }
                )
            }
        }

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [isClient, initialLat, initialLng, onLocationSelect])

    if (!isClient) {
        return (
            <div
                style={{ height }}
                className="rounded-lg border bg-muted flex items-center justify-center"
            >
                <p className="text-muted-foreground">กำลังโหลดแผนที่...</p>
            </div>
        )
    }

    return (
        <div className="relative">
            <div
                id="map-container"
                style={{ height }}
                className="rounded-lg border overflow-hidden z-0"
            />
            <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                <p className="text-muted-foreground">
                    💡 <strong>วิธีใช้:</strong> คลิกบนแผนที่หรือลากปักหมุดเพื่อเลือกตำแหน่ง
                </p>
            </div>
        </div>
    )
}
