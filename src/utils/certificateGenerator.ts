import jsPDF from 'jspdf'

export interface CertificateParams {
  employeeName: string
  nip: string
  divisionName: string
  position: string
  date: string
}

export function generateTopAchieverCertificate({
  employeeName,
  nip,
  divisionName,
  position,
  date
}: CertificateParams) {
  // A4 Landscape format (297mm x 210mm)
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const centerX = pageWidth / 2

  // --- PALETTE WARNA ---
  const color = {
    bg: [252, 250, 245] as [number, number, number],
    gold: [212, 175, 55] as [number, number, number],
    navy: [15, 32, 67] as [number, number, number],
    darkGray: [70, 70, 70] as [number, number, number],
    lightGray: [100, 100, 100] as [number, number, number]
  }

  // --- BACKGROUND & BORDERS ---
  doc.setFillColor(...color.bg)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Outer Border (Thick Gold)
  doc.setDrawColor(...color.gold)
  doc.setLineWidth(4)
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24)

  // Inner Border (Thin Navy)
  // Batas bawah border ini berada di koordinat Y = 192
  doc.setDrawColor(...color.navy)
  doc.setLineWidth(0.5)
  doc.rect(18, 18, pageWidth - 36, pageHeight - 36)

  // --- HEADER ---
  doc.setFont('times', 'bold')
  doc.setFontSize(34) // Diperkecil dari 42
  doc.setTextColor(...color.gold)
  doc.text('PIAGAM PENGHARGAAN', centerX, 45, { align: 'center' }) // Dinaikkan ke 45

  // Subtitle / Company Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10) // Diperkecil dari 11
  doc.setTextColor(...color.navy)
  doc.text('PT. CAKRA MEDIA DATA  •  KPI MANAGEMENT SYSTEM', centerX, 53, { align: 'center' })

  // Divider Line
  doc.setDrawColor(...color.gold)
  doc.setLineWidth(0.5)
  doc.line(centerX - 50, 58, centerX + 50, 58)

  // --- BODY TEXT ---
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12) // Diperkecil dari 14
  doc.setTextColor(...color.darkGray)
  doc.text('Diberikan sebagai bentuk apresiasi dan penghargaan setinggi-tingginya kepada:', centerX, 78, { align: 'center' })

  // Employee Name
  doc.setFont('times', 'bolditalic')
  doc.setFontSize(38) // Diperkecil dari 44
  doc.setTextColor(...color.navy)
  doc.text(employeeName, centerX, 98, { align: 'center' }) // Dinaikkan ke 98

  // Employee Details (NIP, Divisi, Posisi)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11) // Diperkecil dari 12
  doc.setTextColor(...color.lightGray)
  const details = `NIP: ${nip || '-'}   |   Divisi: ${divisionName || '-'}   |   Posisi: ${position || '-'}`
  doc.text(details, centerX, 112, { align: 'center' })

  // Achievement Description
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(12) // Diperkecil dari 14
  doc.setTextColor(...color.darkGray)
  doc.text('Atas kontribusi luar biasa, dedikasi, serta pencapaian kinerja prima', centerX, 128, { align: 'center' })
  doc.text('sehingga berhasil meraih predikat sebagai:', centerX, 135, { align: 'center' })

  // Achievement Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20) // Diperkecil dari 22
  doc.setTextColor(...color.gold)
  doc.text('TOP PERFORMER LINTAS DIVISI', centerX, 148, { align: 'center' })

  // --- FOOTER & SIGNATURES ---
  // Koordinat Y tanda tangan dinaikkan drastis dari 192 menjadi 172 agar tidak menabrak border
  const signY = 172 
  const leftCenterX = 75
  const rightCenterX = pageWidth - 75
  const lineHalfWidth = 35
  
  // Left Signature (Date)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10) // Diperkecil
  doc.setTextColor(...color.darkGray)
  doc.text('Diterbitkan pada tanggal:', leftCenterX, signY - 14, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(date, leftCenterX, signY, { align: 'center' })
  
  doc.setDrawColor(...color.darkGray)
  doc.setLineWidth(0.5)
  doc.line(leftCenterX - lineHalfWidth, signY + 3, leftCenterX + lineHalfWidth, signY + 3)

  // Right Signature (CEO)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Disahkan Oleh,', rightCenterX, signY - 14, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Bapak Khalil', rightCenterX, signY, { align: 'center' })
  
  doc.setDrawColor(...color.darkGray)
  doc.line(rightCenterX - lineHalfWidth, signY + 3, rightCenterX + lineHalfWidth, signY + 3)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9) // Diperkecil
  doc.text('CEO PT. Cakra Media Data', rightCenterX, signY + 8, { align: 'center' })

  // --- SAVE PDF ---
  const filename = `Sertifikat_Top_Achiever_${employeeName.replace(/\s+/g, '_')}.pdf`
  doc.save(filename)
}
