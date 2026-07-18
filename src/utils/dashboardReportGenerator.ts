import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface DashboardMetrics {
  company_average_score: number
  top_division: string
  total_completed_evals: number
}

export interface TrendData {
  period_name: string
  average_score: number
}

export interface DivisionPerformance {
  division_name: string
  average_score: number
}

export interface StatusDistribution {
  status: string
  count: number
}

export interface TopEmployee {
  name: string
  division_name: string
  total_score: number
}

export interface ReportParams {
  periodName: string
  metrics: DashboardMetrics
  trends: TrendData[]
  divisionPerformance: DivisionPerformance[]
  statusDistribution: StatusDistribution[]
  topEmployees: TopEmployee[]
  printedBy: string
}

function getGradeFromScore(score: number): string {
  if (score >= 86) return 'A'
  if (score >= 71) return 'B'
  if (score >= 56) return 'C'
  if (score >= 40) return 'D'
  return 'E'
}

export function generateDashboardPDF({
  periodName,
  metrics,
  trends,
  divisionPerformance,
  statusDistribution,
  topEmployees,
  printedBy
}: ReportParams) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  // 1. Kop Surat (Company Header)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(30, 41, 59) // Slate-800
  doc.text('PT. CAKRA MEDIA DATA', pageWidth / 2, 18, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139) // Slate-500
  doc.text('Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali', pageWidth / 2, 23, { align: 'center' })
  
  // Double line header separator
  doc.setLineWidth(0.6)
  doc.setDrawColor(71, 85, 105) // Slate-600
  doc.line(15, 27, pageWidth - 15, 27)
  doc.setLineWidth(0.2)
  doc.line(15, 28.5, pageWidth - 15, 28.5)

  // 2. Judul Laporan
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42) // Slate-900
  doc.text('LAPORAN EKSEKUTIF KINERJA PERUSAHAAN', pageWidth / 2, 38, { align: 'center' })

  // 3. Metadata Laporan (Tabel Informasi)
  autoTable(doc, {
    startY: 44,
    margin: { left: 15, right: 15 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: 5, textColor: [71, 85, 105] },
      2: { cellWidth: 60 },
      3: { cellWidth: 30, fontStyle: 'bold', textColor: [71, 85, 105] },
      4: { cellWidth: 5, textColor: [71, 85, 105] },
      5: { cellWidth: 45 }
    },
    body: [
      ['Periode Evaluasi', ':', periodName || 'Semua Periode', 'Tanggal Cetak', ':', today],
      ['Dicetak Oleh', ':', printedBy || 'Eksekutif', 'Waktu Cetak', ':', currentTime + ' WITA']
    ]
  })

  let currentY = (doc as any).lastAutoTable.finalY + 8

  // 4. Ringkasan Eksekutif (Executive Summary Cards styled in a grid table)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(29, 78, 216) // Blue-700
  doc.text('I. RINGKASAN EKSEKUTIF', 15, currentY)
  
  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' }, // Blue-500
    head: [['Rata-Rata Kinerja Perusahaan', 'Divisi Performa Terbaik', 'Total Evaluasi Final']],
    body: [[
      `${metrics.company_average_score.toFixed(2)} / 100`,
      metrics.top_division || '-',
      `${metrics.total_completed_evals} Evaluasi`
    ]],
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { fontStyle: 'bold' },
      2: { fontStyle: 'bold' }
    }
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  // 5. Peringkat Kinerja Divisi
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(29, 78, 216)
  doc.text('II. PERINGKAT KINERJA DIVISI', 15, currentY)

  const divisionRows = divisionPerformance.map((div, index) => [
    index + 1,
    div.division_name,
    div.average_score.toFixed(2),
    getGradeFromScore(div.average_score)
  ])

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    head: [['No', 'Nama Divisi', 'Rata-Rata Nilai', 'Grade']],
    body: divisionRows.length > 0 ? divisionRows : [['-', 'Belum ada data performa divisi', '-', '-']],
    styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'center', fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  // 6. Pegawai Bintang (Top 5 Performer)
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(29, 78, 216)
  doc.text('III. PEGAWAI BINTANG (TOP 5 PEGAWAI TERBAIK)', 15, currentY)

  const topEmpRows = topEmployees.map((emp, index) => [
    index + 1,
    emp.name,
    emp.division_name,
    emp.total_score.toFixed(2),
    getGradeFromScore(emp.total_score)
  ])

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    head: [['Peringkat', 'Nama Pegawai', 'Divisi', 'Skor Akhir', 'Grade']],
    body: topEmpRows.length > 0 ? topEmpRows : [['-', 'Belum ada data pegawai berprestasi', '-', '-', '-']],
    styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
    headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' }, // Amber-500
    columnStyles: {
      0: { halign: 'center', cellWidth: 25, fontStyle: 'bold' },
      3: { halign: 'center', fontStyle: 'bold', textColor: [29, 78, 216] },
      4: { halign: 'center', fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [254, 252, 232] } // Light yellow tint for top stars
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  // 7. Distribusi Status & Tren Perusahaan (Diletakkan bersebelahan atau berurutan)
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(29, 78, 216)
  doc.text('IV. DISTRIBUSI STATUS EVALUASI & TREN KINERJA', 15, currentY)

  // Buat dua tabel terpisah atau berdampingan. Lebih aman berurutan agar rapi di PDF.
  const statusRows = statusDistribution.map(item => [
    item.status.toUpperCase(),
    `${item.count} Dokumen`
  ])

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 15, right: 105 }, // Bagian kiri halaman
    theme: 'grid',
    head: [['Status Penilaian', 'Jumlah']],
    body: statusRows.length > 0 ? statusRows : [['-', '-']],
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [100, 116, 139], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'center', fontStyle: 'bold' }
    }
  })

  // Tren Perusahaan di sebelah kanan
  const trendRows = trends.map(t => [
    t.period_name,
    t.average_score.toFixed(2)
  ])

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 110, right: 15 }, // Bagian kanan halaman
    theme: 'grid',
    head: [['Periode Tren', 'Rata-Rata Kinerja']],
    body: trendRows.length > 0 ? trendRows : [['-', '-']],
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }, // Indigo-600
    columnStyles: {
      1: { halign: 'center', fontStyle: 'bold' }
    }
  })

  // Penentu baris paling bawah dari dua tabel berdampingan
  const lastY = Math.max((doc as any).lastAutoTable.finalY, currentY)

  // 8. Tanda Tangan & Penutup
  let finalY = lastY + 15
  if (finalY > pageHeight - 50) {
    doc.addPage()
    finalY = 30
  }

  const signX = pageWidth - 60
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'normal')
  doc.text(`Badung, ${today}`, signX, finalY, { align: 'center' })
  doc.text('Mengetahui & Menyetujui,', signX, finalY + 5, { align: 'center' })
  doc.text('CEO PT. Cakra Media Data', signX, finalY + 10, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.text('Bapak Khalil', signX, finalY + 35, { align: 'center' })
  doc.setLineWidth(0.2)
  doc.line(signX - 25, finalY + 36, signX + 25, finalY + 36)

  // Save File
  const filename = `Laporan_Eksekutif_KPI_${periodName.replace(/\s+/g, '_')}.pdf`
  doc.save(filename)
}
