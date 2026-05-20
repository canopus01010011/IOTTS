export function formatEquipmentItem(item) {
  if (!item) return '—'
  const name = item.label || item.name || item.type
  const qty = item.quantity ?? 1
  if (name && item.equipment_id) {
    return `${name} (${item.equipment_id}) ×${qty}`
  }
  if (name) return `${name} ×${qty}`
  if (item.equipment_id) return `${item.equipment_id} ×${qty}`
  return '—'
}

export function formatEquipmentList(list) {
  if (!Array.isArray(list) || list.length === 0) return '—'
  return list.map(formatEquipmentItem).join(', ')
}

export function toDateTimeLocal(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function toIsoDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isValidEquipmentItem(item) {
  if (!item || Number(item.quantity) < 1) return false
  return Boolean(
    item.label?.trim() ||
    item.name?.trim() ||
    item.type?.trim() ||
    item.equipment_id?.trim() ||
    item.serial_number?.trim(),
  )
}

function extractBody(data) {
  if (!data || typeof data !== 'object') return null
  if (data.mission && typeof data.mission === 'object') return data.mission
  if (data.file_format && typeof data.file_format === 'object') return data.file_format
  return data
}

export function isMissionImportFormat(data) {
  const body = extractBody(data)
  if (!body) return false
  const hasSchedule = Boolean(body.scheduled_start_date || body.date)
  const hasDriver = Boolean(body.driver_id || body.driver || body.conducteur)
  const hasTech = Boolean(body.technician_id || body.technician || body.technicien)
  const hasSite = Boolean(body.site_id || body.site || body.site_name)
  const hasEquip =
    (Array.isArray(body.equipment_list) && body.equipment_list.length > 0) ||
    (Array.isArray(body.equipements) && body.equipements.length > 0)
  return Boolean(hasSchedule && hasDriver && hasTech && hasSite && hasEquip)
}

/** Human-readable summary of a rich import JSON (client preview). */
export function summarizeImportPreview(data) {
  const body = extractBody(data) || {}
  const lines = []

  const ref = body.reference || data?.reference
  if (ref) lines.push(`Référence : ${ref}`)
  if (body.scheduled_start_date) lines.push(`Début : ${formatDateTime(body.scheduled_start_date)}`)
  if (body.scheduled_end_date) lines.push(`Fin : ${formatDateTime(body.scheduled_end_date)}`)

  const site = body.site || {}
  if (body.site_id) lines.push(`Site (id) : ${body.site_id}`)
  else if (site.name) lines.push(`Site : ${site.name} — ${site.address || '—'}`)

  const driver = body.driver || {}
  if (body.driver_id) lines.push(`Conducteur (id, doit exister) : ${body.driver_id}`)
  else if (driver.id) lines.push(`Conducteur (id, doit exister) : ${driver.id}`)
  else if (driver.full_name || driver.email) {
    lines.push(`Conducteur (doit exister) : ${driver.full_name || driver.email}`)
  }

  const tech = body.technician || {}
  if (body.technician_id) lines.push(`Technicien (id, doit exister) : ${body.technician_id}`)
  else if (tech.id) lines.push(`Technicien (id, doit exister) : ${tech.id}`)
  else if (tech.full_name || tech.email) {
    lines.push(`Technicien (doit exister) : ${tech.full_name || tech.email}`)
  }

  const list = body.equipment_list || body.equipements || []
  if (Array.isArray(list) && list.length) {
    lines.push(`Équipements (${list.length}) :`)
    list.forEach((eq, i) => {
      if (typeof eq === 'string') lines.push(`  ${i + 1}. ${eq}`)
      else {
        const name = eq.label || eq.type || eq.name || '—'
        const sn = eq.serial_number || eq.serial || ''
        lines.push(`  ${i + 1}. ${name}${sn ? ` [${sn}]` : ''} ×${eq.quantity || 1}`)
      }
    })
  }

  const container = body.container || {}
  if (body.container_id) lines.push(`Conteneur (id) : ${body.container_id}`)
  else if (container.qr_code) lines.push(`Conteneur : ${container.qr_code}`)
  const gps = container.gps_device || body.gps_device
  if (gps?.device_serial_number) {
    lines.push(`GPS : ${gps.device_serial_number} (${gps.device_status || 'active'})`)
  }

  return lines
}
