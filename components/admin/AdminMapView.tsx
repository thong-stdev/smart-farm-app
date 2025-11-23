"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface PlotData {
    id: string
    name: string
    latitude: number
    longitude: number
    sizeRai: number
    sizeNgan: number
    sizeWa: number
    owner: string
    activeCycle: {
        cropName: string
        cropType: string
        startDate: string
    } | null
}

interface Props {
    plots: PlotData[]
}

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

export default function AdminMapView({ plots }: Props) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<L.Map | null>(null)

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return

        // Initialize map
        const map = L.map(mapRef.current).setView([13.7563, 100.5018], 6) // Center on Thailand

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map)

        mapInstanceRef.current = map

        // Add markers for each plot
        const markers: L.Marker[] = []
        plots.forEach((plot) => {
            if (plot.latitude && plot.longitude) {
                const totalRai = plot.sizeRai + plot.sizeNgan / 4 + plot.sizeWa / 400

                // Different icon colors for active/inactive
                const iconHtml = plot.activeCycle
                    ? '<div style="background-color: #16a34a; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white;"></div>'
                    : '<div style="background-color: #9ca3af; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white;"></div>'

                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: "custom-marker",
                    iconSize: [25, 25],
                    iconAnchor: [12, 24],
                })

                const marker = L.marker([plot.latitude, plot.longitude], { icon: customIcon })
                    .addTo(map)
                    .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 8px; color: #16a34a;">${plot.name}</h3>
              <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                👤 <strong>เจ้าของ:</strong> ${plot.owner}
              </div>
              <div style="font-size: 13px; color: #666; margin-bottom: 4px;">
                📏 <strong>ขนาด:</strong> ${totalRai.toFixed(2)} ไร่
              </div>
              ${plot.activeCycle
                            ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <div style=" font-size: 13px; color: #16a34a; font-weight: 600; margin-bottom: 4px;">
                    🌱 กำลังปลูก
                  </div>
                  <div style="font-size: 12px; color: #666;">
                    ${plot.activeCycle.cropType} - ${plot.activeCycle.cropName}
                  </div>
                  <div style="font-size: 11px; color: #999; margin-top: 2px;">
                    เริ่ม: ${new Date(plot.activeCycle.startDate).toLocaleDateString("th-TH")}
                  </div>
                </div>
              `
                            : `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <div style="font-size: 13px; color: #9ca3af;">
                    ⭕ ยังไม่มีการปลูก
                  </div>
                </div>
              `
                        }
              <a href="/plots/${plot.id}" style="display: block; margin-top: 8px; text-align: center; background: #16a34a; color: white; padding: 6px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                ดูรายละเอียด →
              </a>
            </div>
          `)

                markers.push(marker)
            }
        })

        // Fit bounds to show all markers
        if (markers.length > 0) {
            const group = L.featureGroup(markers)
            map.fitBounds(group.getBounds().pad(0.1))
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [plots])

    return <div ref={mapRef} className="h-[600px] rounded-lg border" />
}
