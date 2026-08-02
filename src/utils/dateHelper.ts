/**
 * Utility helper untuk parsing tanggal secara robust dan aman,
 * mencegah terjadinya "Invalid Date" atau RangeError pada beberapa browser
 * (seperti Safari/Firefox) saat memproses format tanggal mentah dari database.
 */

export function parseSafeDate(dateVal: any): Date {
  if (!dateVal) return new Date()

  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? new Date() : dateVal
  }

  // Coba parse langsung
  let d = new Date(dateVal)
  if (!isNaN(d.getTime())) return d

  // Jika berupa string, coba ganti spasi dengan T (format ISO standar)
  if (typeof dateVal === 'string') {
    const cleaned = dateVal.trim()
    
    // Format: YYYY-MM-DD HH:mm:ss
    if (cleaned.includes(' ')) {
      d = new Date(cleaned.replace(' ', 'T'))
      if (!isNaN(d.getTime())) return d
    }
    
    // Bersihkan timezone tambahan seperti WITA/WIB/WIT jika ada
    const noTz = cleaned.replace(/\s*[A-Z]{3,4}$/i, '')
    d = new Date(noTz)
    if (!isNaN(d.getTime())) return d

    if (noTz.includes(' ')) {
      d = new Date(noTz.replace(' ', 'T'))
      if (!isNaN(d.getTime())) return d
    }
  }

  return new Date()
}

/**
 * Format tanggal ke Bahasa Indonesia secara aman
 */
export function formatIndoDate(dateVal: any, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
  try {
    const d = parseSafeDate(dateVal)
    return d.toLocaleDateString('id-ID', options)
  } catch (e) {
    return '-'
  }
}

/**
 * Format jam ke Bahasa Indonesia secara aman
 */
export function formatIndoTime(dateVal: any, options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' }): string {
  try {
    const d = parseSafeDate(dateVal)
    return d.toLocaleTimeString('id-ID', options)
  } catch (e) {
    return '--:--'
  }
}
