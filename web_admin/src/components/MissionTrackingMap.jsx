import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'
import { WAREHOUSE } from '../constants/warehouse'

/** Match iot_system GPS publish interval (default 5s) */
const POLL_MS = 5000

function hasValidCoords(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Live delivery map for a single mission (site + IoT container trail).
 */
export default function MissionTrackingMap({ mission }) {
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const layersRef = useRef(null)

  const [leafletReady, setLeafletReady] = useState(false)
  const [liveGps, setLiveGps] = useState(null)
  const [trackPoints, setTrackPoints] = useState([])
  const [gpsError, setGpsError] = useState('')

  const containerId = mission?.containerId
  const siteLat = mission?.siteLat
  const siteLng = mission?.siteLng
  const hasSite = hasValidCoords(siteLat, siteLng)

  const containerLat = liveGps?.latitude != null ? Number(liveGps.latitude) : null
  const containerLng = liveGps?.longitude != null ? Number(liveGps.longitude) : null
  const hasContainer = hasValidCoords(containerLat, containerLng)

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link')
      l.id = 'leaflet-css'
      l.rel = 'stylesheet'
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(l)
    }
    if (!window.L) {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = () => setLeafletReady(true)
      document.head.appendChild(s)
    } else setLeafletReady(true)
  }, [])

  const loadGps = useCallback(async () => {
    if (!containerId) {
      setGpsError('Aucun conteneur lié à cette mission.')
      return
    }
    setGpsError('')
    try {
      const [liveRes, histRes] = await Promise.all([
        api.get(`/gps/container/${containerId}/live`),
        api.get(`/gps/container/${containerId}/history`, { params: { limit: 300 } }),
      ])
      setLiveGps(liveRes.data?.data || null)
      setTrackPoints(histRes.data?.data || [])
    } catch (err) {
      setLiveGps(null)
      setTrackPoints([])
      setGpsError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Impossible de charger le GPS IoT.',
      )
    }
  }, [containerId])

  useEffect(() => {
    loadGps()
    const id = setInterval(loadGps, POLL_MS)
    return () => clearInterval(id)
  }, [loadGps])

  useEffect(() => {
    if (!leafletReady || !window.L || !mapRef.current) return
    const L = window.L

    const centerLat = hasContainer ? containerLat : siteLat
    const centerLng = hasContainer ? containerLng : siteLng
    if (!hasValidCoords(centerLat, centerLng)) return

    if (mapObj.current) {
      mapObj.current.remove()
      mapObj.current = null
      layersRef.current = null
    }

    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      .setView([centerLat, centerLng], 13)
    mapObj.current = map
    layersRef.current = L.layerGroup().addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    const siteIcon = L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;background:#0f6e56;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #4ade80;font-size:20px;">📍</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })
    const truckIcon = L.divIcon({
      className: '',
      html: `<div style="width:44px;height:44px;background:#1d4ed8;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #60a5fa;font-size:22px;box-shadow:0 0 0 6px rgba(59,130,246,.25);">🚛</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    })
    const warehouseIcon = L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;background:#92400e;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fbbf24;font-size:20px;">🏭</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })

    const bounds = []

    L.marker([WAREHOUSE.latitude, WAREHOUSE.longitude], { icon: warehouseIcon })
      .addTo(layersRef.current)
      .bindPopup(`<b>${WAREHOUSE.name}</b><br/>Point de départ simulation`)
    bounds.push([WAREHOUSE.latitude, WAREHOUSE.longitude])

    if (hasSite) {
      L.marker([siteLat, siteLng], { icon: siteIcon })
        .addTo(layersRef.current)
        .bindPopup(`<b>Site : ${mission.siteName || 'Destination'}</b>`)
      bounds.push([siteLat, siteLng])
    }

    if (hasContainer) {
      L.marker([containerLat, containerLng], { icon: truckIcon })
        .addTo(layersRef.current)
        .bindPopup(
          `<b>Livraison IoT</b><br/>${liveGps?.device_serial_number || ''}<br/>🔋 ${liveGps?.battery_level ?? '—'}%`,
        )
      bounds.push([containerLat, containerLng])
    }

    if (trackPoints.length >= 2) {
      const latlngs = trackPoints.map((p) => [Number(p.latitude), Number(p.longitude)])
      L.polyline(latlngs, { color: '#3b82f6', weight: 4, opacity: 0.85 }).addTo(layersRef.current)
      latlngs.forEach((ll) => bounds.push(ll))
    } else if (hasContainer && hasSite) {
      L.polyline(
        [[containerLat, containerLng], [siteLat, siteLng]],
        { color: '#3b82f6', weight: 2, dashArray: '8 6', opacity: 0.55 },
      ).addTo(layersRef.current)
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    return () => {
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current = null
        layersRef.current = null
      }
    }
  }, [
    leafletReady,
    mission?.id,
    siteLat,
    siteLng,
    hasSite,
    containerLat,
    containerLng,
    hasContainer,
    liveGps?.battery_level,
    liveGps?.device_serial_number,
    trackPoints.length,
    mission?.siteName,
  ])

  return (
    <div
      style={{
        background: '#111827',
        border: '0.5px solid rgba(59,130,246,.25)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '0.5px solid rgba(59,130,246,.15)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Suivi livraison — {mission.id}
            {mission.status === 'pending' && (
              <span style={{ marginLeft: 8, fontSize: 11, color: '#fbbf24' }}>(en attente scan entrepôt)</span>
            )}
            {mission.status === 'in-progress' && (
              <span style={{ marginLeft: 8, fontSize: 11, color: '#4ade80' }}>(en cours)</span>
            )}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)', marginTop: 4 }}>
            {mission.siteName}
            {mission.driver ? ` · ${mission.driver}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasContainer && (
            <span style={{ fontSize: 11, color: '#4ade80' }}>● Live IoT (refresh {POLL_MS / 1000}s)</span>
          )}
          <button
            type="button"
            onClick={loadGps}
            style={{
              background: 'rgba(59,130,246,.1)',
              border: '0.5px solid rgba(59,130,246,.3)',
              color: '#60a5fa',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Actualiser
          </button>
        </div>
      </div>

      {!containerId ? (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#fbbf24', fontSize: 13 }}>
            Cette mission n&apos;a pas de conteneur — le suivi IoT n&apos;est pas disponible.
          </p>
        </div>
      ) : hasSite || hasContainer ? (
        <div ref={mapRef} style={{ width: '100%', height: 420 }} />
      ) : (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'rgba(148,163,184,.7)', fontSize: 13 }}>
            En attente de positions… Lancez <code style={{ color: '#93c5fd' }}>python gps_simulator.py --listen</code> puis scannez le QR mission à l&apos;entrepôt.
          </p>
        </div>
      )}

      <div
        style={{
          padding: '12px 18px',
          background: '#0d1426',
          borderTop: '0.5px solid rgba(59,130,246,.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          fontSize: 12,
        }}
      >
        <div>
          <p style={{ color: 'rgba(148,163,184,.45)', marginBottom: 4 }}>Device IoT</p>
          <p style={{ color: '#cbd5e1' }}>{liveGps?.device_serial_number || '—'}</p>
        </div>
        <div>
          <p style={{ color: 'rgba(148,163,184,.45)', marginBottom: 4 }}>Position conteneur</p>
          <p style={{ color: '#60a5fa' }}>
            {hasContainer
              ? `${containerLat.toFixed(5)}, ${containerLng.toFixed(5)}`
              : 'En attente…'}
          </p>
        </div>
        <div>
          <p style={{ color: 'rgba(148,163,184,.45)', marginBottom: 4 }}>Entrepôt départ</p>
          <p style={{ color: '#fbbf24' }}>
            {WAREHOUSE.name} · {WAREHOUSE.latitude.toFixed(5)}, {WAREHOUSE.longitude.toFixed(5)}
          </p>
        </div>
        <div>
          <p style={{ color: 'rgba(148,163,184,.45)', marginBottom: 4 }}>Site destination</p>
          <p style={{ color: '#cbd5e1' }}>
            {hasSite ? `${siteLat.toFixed(5)}, ${siteLng.toFixed(5)}` : '—'}
          </p>
        </div>
        <div>
          <p style={{ color: 'rgba(148,163,184,.45)', marginBottom: 4 }}>Batterie / points</p>
          <p style={{ color: '#cbd5e1' }}>
            {liveGps?.battery_level != null ? `${liveGps.battery_level}%` : '—'}
            {' · '}
            {trackPoints.length} pts
          </p>
        </div>
      </div>

      {gpsError && (
        <p style={{ padding: '8px 18px', margin: 0, fontSize: 11, color: '#f87171' }}>{gpsError}</p>
      )}
    </div>
  )
}
