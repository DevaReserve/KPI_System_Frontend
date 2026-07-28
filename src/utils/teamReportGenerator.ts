import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface TeamReportItem {
  employee_id: number
  employee_name: string
  total_score?: number
  evaluation_status: string
}

export interface TeamReportParams {
  teamMembers: TeamReportItem[]
  managerName?: string
  divisionName?: string
  periodName?: string
}

function getGradeFromScore(score: number): string {
  if (score >= 86) return 'A'
  if (score >= 71) return 'B'
  if (score >= 56) return 'C'
  if (score >= 41) return 'D'
  return 'E'
}

function formatEvaluationStatus(status: string): string {
  if (status === 'submitted') return 'Selesai'
  if (status === 'appealed') return 'Ada Sanggahan'
  if (status === 'draft') return 'Draft'
  return 'Belum Dinilai'
}

// Warna netral yang konsisten untuk seluruh dokumen (hitam & abu-abu)
const COLOR_BLACK     = [20, 20, 20] as [number, number, number]
const COLOR_DARK      = [40, 40, 40] as [number, number, number]
const COLOR_HEADER    = [55, 55, 55] as [number, number, number]    // Abu-abu gelap untuk header tabel
const COLOR_SUBHEADER = [90, 90, 90] as [number, number, number]    // Abu-abu medium
const COLOR_ALT_ROW   = [245, 245, 245] as [number, number, number] // Abu sangat muda untuk alternate row
const COLOR_WHITE     = [255, 255, 255] as [number, number, number]

export function generateTeamReportPDF({
  teamMembers,
  managerName,
  divisionName,
  periodName
}: TeamReportParams) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  // 1. Kop Surat (Company Header)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...COLOR_BLACK)
  doc.text('PT. CAKRA MEDIA DATA', pageWidth / 2, 18, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_SUBHEADER)
  doc.text('Jl. Raya Mambal Ubud - Br. Sigaran Desa Mekar Bhuana, Badung, Bali', pageWidth / 2, 23, { align: 'center' })

  // Double line header separator
  doc.setLineWidth(0.6)
  doc.setDrawColor(...COLOR_DARK)
  doc.line(15, 27, pageWidth - 15, 27)
  doc.setLineWidth(0.2)
  doc.line(15, 28.5, pageWidth - 15, 28.5)

  // 2. Judul Laporan
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...COLOR_BLACK)
  doc.text('LAPORAN REKAPITULASI PENILAIAN KINERJA TIM', pageWidth / 2, 38, { align: 'center' })

  // 3. Metadata Laporan (Tabel Informasi)
  autoTable(doc, {
    startY: 44,
    margin: { left: 15, right: 15 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1, textColor: COLOR_DARK },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', textColor: COLOR_SUBHEADER },
      1: { cellWidth: 5,  textColor: COLOR_SUBHEADER },
      2: { cellWidth: 55, textColor: COLOR_DARK },
      3: { cellWidth: 32, fontStyle: 'bold', textColor: COLOR_SUBHEADER },
      4: { cellWidth: 5,  textColor: COLOR_SUBHEADER },
      5: { cellWidth: 45, textColor: COLOR_DARK }
    },
    body: [
      ['Manajer / Supervisor', ':', managerName || '-', 'Tanggal Cetak', ':', today],
      ['Divisi / Unit Kerja',  ':', divisionName || '-', 'Waktu Cetak',   ':', currentTime + ' WITA'],
      ['Periode Penilaian',    ':', periodName || 'Periode Aktif', 'Total Anggota', ':', `${teamMembers.length} Pegawai`]
    ]
  })

  let currentY = (doc as any).lastAutoTable.finalY + 8

  // 4. Ringkasan Kinerja Tim
  const evaluatedList = teamMembers.filter(m => m.evaluation_status === 'submitted' || m.evaluation_status === 'appealed')
  const totalScores = evaluatedList.reduce((sum, item) => sum + (item.total_score || 0), 0)
  const avgScoreNum = evaluatedList.length > 0 ? (totalScores / evaluatedList.length) : 0
  const avgScoreStr = avgScoreNum.toFixed(2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_BLACK)
  doc.text('I. RINGKASAN KINERJA TIM', 15, currentY)

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4, halign: 'center', valign: 'middle', textColor: COLOR_DARK },
    headStyles: { fillColor: COLOR_HEADER, textColor: COLOR_WHITE, fontStyle: 'bold' },
    head: [['Total Anggota Tim', 'Anggota Selesai Dinilai', 'Rata-Rata Skor Tim', 'Grade Rata-Rata']],
    body: [[
      `${teamMembers.length} Orang`,
      `${evaluatedList.length} Orang`,
      `${avgScoreStr} / 100`,
      getGradeFromScore(avgScoreNum)
    ]],
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLOR_BLACK },
      1: { fontStyle: 'bold', textColor: COLOR_BLACK },
      2: { fontStyle: 'bold', textColor: COLOR_BLACK },
      3: { fontStyle: 'bold', textColor: COLOR_BLACK }
    }
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  // 5. Tabel Daftar Anggota Tim
  if (currentY > pageHeight - 60) {
    doc.addPage()
    currentY = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_BLACK)
  doc.text('II. DAFTAR REKAPITULASI PENILAIAN ANGGOTA TIM', 15, currentY)

  const tableRows = teamMembers.map((item, index) => {
    const scoreNum = item.total_score !== undefined && item.total_score !== null ? Number(item.total_score) : 0
    const scoreStr = item.total_score !== undefined && item.total_score !== null ? scoreNum.toFixed(2) : '0.00'
    const gradeStr = item.total_score !== undefined && item.total_score !== null ? getGradeFromScore(scoreNum) : '-'
    const statusStr = formatEvaluationStatus(item.evaluation_status)

    return [
      index + 1,
      item.employee_name,
      scoreStr,
      gradeStr,
      statusStr
    ]
  })

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    head: [['No', 'Nama Pegawai', 'Skor Akhir', 'Grade', 'Status Penilaian']],
    body: tableRows.length > 0 ? tableRows : [['-', 'Belum ada anggota tim', '-', '-', '-']],
    styles: { fontSize: 9, cellPadding: 3.5, valign: 'middle', textColor: COLOR_DARK },
    headStyles: { fillColor: COLOR_HEADER, textColor: COLOR_WHITE, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', fontStyle: 'bold', textColor: COLOR_BLACK },
      2: { halign: 'center', cellWidth: 30, fontStyle: 'bold', textColor: COLOR_BLACK },
      3: { halign: 'center', cellWidth: 25, fontStyle: 'bold', textColor: COLOR_BLACK },
      4: { halign: 'center', cellWidth: 45 }
    },
    alternateRowStyles: { fillColor: COLOR_ALT_ROW }
  })

  // 6. Tanda Tangan & Penutup
  let finalY = (doc as any).lastAutoTable.finalY + 15
  if (finalY > pageHeight - 50) {
    doc.addPage()
    finalY = 30
  }

  const leftSignX = 50
  const rightSignX = pageWidth - 60

  doc.setFontSize(9)
  doc.setTextColor(...COLOR_DARK)
  doc.setFont('helvetica', 'normal')

  doc.text(`Badung, ${today}`, rightSignX, finalY, { align: 'center' })

  doc.text('Dibuat Oleh,', leftSignX, finalY + 5, { align: 'center' })
  doc.text('Manajer / Supervisor', leftSignX, finalY + 10, { align: 'center' })

  doc.text('Mengetahui & Menyetujui,', rightSignX, finalY + 5, { align: 'center' })
  doc.text('CEO PT. Cakra Media Data', rightSignX, finalY + 10, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.text(managerName || 'Manajer Tim', leftSignX, finalY + 35, { align: 'center' })
  doc.setLineWidth(0.2)
  doc.line(leftSignX - 28, finalY + 36, leftSignX + 28, finalY + 36)

  doc.text('Bapak Khalil', rightSignX, finalY + 35, { align: 'center' })
  doc.line(rightSignX - 28, finalY + 36, rightSignX + 28, finalY + 36)

  // Footer / Page numbers
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' })
    doc.text('PT. Cakra Media Data - Sistem KPI', 15, pageHeight - 10, { align: 'left' })
  }

  const safeDate = new Date().toISOString().split('T')[0]
  const filename = `Laporan_Rekap_Tim_${safeDate}.pdf`
  doc.save(filename)
  return doc
}
