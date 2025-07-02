import {jsPDF} from "jspdf"

export const generateRostersPDF = (data: any, name: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const padding = 10

  data.forEach((roster, index) => {
    // Начинаем с новой страницы, кроме первой
    if (index > 0) {
      doc.addPage()
    }

    let y = 20

    // Имя игрока — крупный шрифт
    doc.setFontSize(16)
    doc.text(roster.name, padding, y)
    y += 7
    if (roster.faction) {
      // Фракция — чуть меньше и серым цветом
      doc.setFontSize(13)
      doc.setTextColor(100, 100, 100) // серый
      doc.text(roster.faction, padding, y)
      y += 7
      doc.setTextColor(0, 0, 0) // вернуть черный
    }
    if (roster.list) {
      // Ростер — обычный текст
      doc.setFontSize(12)
      const splitText = doc.splitTextToSize(roster.list.replace('\nundefined', ''), pageWidth - 2 * padding)
      doc.text(splitText, padding, y)
    }
    if (roster.listImg) {
      doc.addImage(roster.listImg, 'PNG', padding, y, 150, 210) // x, y, width, height
    }
  })

  // Сохранить PDF
  doc.save(`${name}.pdf`)
}