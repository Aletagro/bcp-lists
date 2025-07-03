import {jsPDF} from 'jspdf'
import html2canvas from 'html2canvas'

interface Pairing {
  table: number;
  firstPlayer: string;
  firstPlayerFaction: string;
  firstPlayerPoints: number;
  secondPlayer: string;
  secondPlayerFaction: string;
  secondPlayerPoints: number;
}

export const generateRostersPDF = (data: any, name: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const padding = 10

  data.forEach((roster: any, index: number) => {
    // Начинаем с новой страницы, кроме первой
    if (index > 0) {
      doc.addPage()
    }
    let y = 20
    // Имя игрока — крупный шрифт
    doc.setFontSize(16)
    doc.text(transliterate(roster.name), padding, y)
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

export const generateRoundPDF = async (
  pairings: Pairing[],
  name: string,
  round: number
) => {
  // 1. Создаем контейнер для таблицы
  const tableContainer = document.createElement('div')
  tableContainer.style.width = '900px' // фиксируемая ширина
  tableContainer.style.margin = 'auto'
  tableContainer.style.padding = '20px'
  tableContainer.style.fontFamily = 'Arial, sans-serif'
  tableContainer.style.position = 'absolute'
  tableContainer.style.left = '-9999px'
  document.body.appendChild(tableContainer)
  // 2. Создаем таблицу
  const table = document.createElement('table')
  table.style.width = '100%'
  table.style.borderCollapse = 'collapse'
  table.style.fontSize = '12px'
  table.style.tableLayout = 'fixed' // ОБЯЗАТЕЛЬНОЕ свойство для фикса ширины
  table.style.border = '1px solid #ccc'
  // 3. Заголовок таблицы
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr');

  ['Table', 'First Player', 'Result', 'Second Player'].forEach(text => {
    const th = document.createElement('th')
    th.textContent = text
    th.style.backgroundColor = '#2d2d2d'
    th.style.color = 'white'
    th.style.textAlign = 'center'
    th.style.padding = '8px'
    th.style.border = '1px solid #444'
    th.style.verticalAlign = 'middle'
    th.style.boxSizing = 'border-box'
    switch (text) {
      case 'Table':
        th.style.width = '10%' // ~90px при width=900px
        break
      case 'Result':
        th.style.width = '20%' // ~180px
        break
      default:
        th.style.width = '35%' // остальные колонки
        break
    }
    headerRow.appendChild(th)
  })

  thead.appendChild(headerRow)
  // 4. Тело таблицы
  const tbody = document.createElement('tbody')

  pairings.forEach(p => {
    const row = document.createElement('tr')

    const tdTable = document.createElement('td')
    tdTable.textContent = p.table.toString()
    tdTable.style.textAlign = 'center'
    tdTable.style.verticalAlign = 'middle'
    tdTable.style.border = '1px solid #ccc'
    tdTable.style.padding = '6px'

    const tdFirst = document.createElement('td')
    tdFirst.innerHTML = `<strong>${p.firstPlayer}</strong><br><small style="color:#666">${p.firstPlayerFaction}</small>`
    tdFirst.style.border = '1px solid #ccc'
    tdFirst.style.padding = '6px'

    const tdResult = document.createElement('td')
    tdResult.textContent = `${p.firstPlayerPoints} - ${p.secondPlayerPoints}`
    tdResult.style.textAlign = 'center'
    tdResult.style.verticalAlign = 'middle'
    tdResult.style.border = '1px solid #ccc'
    tdResult.style.padding = '6px'

    const tdSecond = document.createElement('td')
    tdSecond.innerHTML = `<strong>${p.secondPlayer}</strong><br><small style="color:#666">${p.secondPlayerFaction}</small>`
    tdSecond.style.border = '1px solid #ccc'
    tdSecond.style.padding = '6px'

    row.appendChild(tdTable)
    row.appendChild(tdFirst)
    row.appendChild(tdResult)
    row.appendChild(tdSecond)
    tbody.appendChild(row)
  })
  table.appendChild(tbody)
  tableContainer.appendChild(table)
  document.body.appendChild(tableContainer)
  // 5. Настройка разбивки на страницы
  const PAGE_HEIGHT_PX = 900 // высота A4 в пикселях
  const rowHeightEstimate = 35
  const rowsPerPage = Math.floor(PAGE_HEIGHT_PX / rowHeightEstimate)
  const pdf = new jsPDF('p', 'px', 'a4')
  let isFirstPage = true
  for (let i = 0; i < pairings.length; i += rowsPerPage) {
    const pageRows = Array.from(table.querySelectorAll('tr')).slice(i, i + rowsPerPage)
    // Создаем новую таблицу только с текущими строками
    const pageTable = document.createElement('table')
    pageTable.style.width = '100%'
    pageTable.style.borderCollapse = 'collapse'
    pageTable.style.tableLayout = 'fixed'
    pageTable.style.fontSize = '12px'
    // Копируем заголовок на каждую страницу
    const pageThead = thead.cloneNode(true) as HTMLTableElement
    pageTable.appendChild(pageThead)
    // Копируем нужные строки
    const pageTbody = document.createElement('tbody')
    pageRows.forEach(r => pageTbody.appendChild(r.cloneNode(true)))
    pageTable.appendChild(pageTbody)

    tableContainer.innerHTML = ''
    tableContainer.appendChild(pageTable)
    // Делаем скриншот
    const canvas = await html2canvas(tableContainer, {
      scale: 2,
      logging: false,
      windowHeight: PAGE_HEIGHT_PX,
    })
    const imgData = canvas.toDataURL('image/png')
    if (!isFirstPage) {
      pdf.addPage()
    }
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    isFirstPage = false
  }
  // Сохраняем
  pdf.save(`${name}-Round-${round}.pdf`)
  // Чистим DOM
  document.body.removeChild(tableContainer)
}

type TransliterationMap = {
  [key in 'а'|'б'|'в'|'г'|'д'|'е'|'ё'|'ж'|'з'|'и'|'й'|'к'|'л'|'м'|'н'|'о'|'п'|'р'|'с'|'т'|'у'|'ф'|'х'|'ц'|'ч'|'ш'|'щ'|'ъ'|'ы'|'ь'|'э'|'ю'|'я'|'А'|'Б'|'В'|'Г'|'Д'|'Е'|'Ё'|'Ж'|'З'|'И'|'Й'|'К'|'Л'|'М'|'Н'|'О'|'П'|'Р'|'С'|'Т'|'У'|'Ф'|'Х'|'Ц'|'Ч'|'Ш'|'Щ'|'Ъ'|'Ы'|'Ь'|'Э'|'Ю'|'Я']: string
}

const transliterate = (text: string) => {
  const map: TransliterationMap = {
    // Строчные буквы
    'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
    'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
    'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
    'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
    'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
    'ш': 'sh',   'щ': 'shch', 'ъ': '',     'ы': 'y',    'ь': '',
    'э': 'e',    'ю': 'yu',   'я': 'ya',
    // Заглавные буквы
    'А': 'A',    'Б': 'B',    'В': 'V',    'Г': 'G',    'Д': 'D',
    'Е': 'E',    'Ё': 'E',    'Ж': 'Zh',   'З': 'Z',    'И': 'I',
    'Й': 'Y',    'К': 'K',    'Л': 'L',    'М': 'M',    'Н': 'N',
    'О': 'O',    'П': 'P',    'Р': 'R',    'С': 'S',    'Т': 'T',
    'У': 'U',    'Ф': 'F',    'Х': 'H',    'Ц': 'C',    'Ч': 'Ch',
    'Ш': 'Sh',   'Щ': 'Shch', 'Ъ': '',     'Ы': 'Y',    'Ь': '',
    'Э': 'E',    'Ю': 'Yu',   'Я': 'Ya'
  };
  return text
    .replace(/[а-яА-ЯёЁ]/g, (char: string) => map[char as keyof TransliterationMap] || char)
}