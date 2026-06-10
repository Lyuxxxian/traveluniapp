const fs = require('fs')
const path = require('path')
const mammoth = require('mammoth')
const XLSX = require('xlsx')

const root = process.cwd()
const files = fs.readdirSync(root)

function findFile(keyword, ext) {
  const file = files.find(name => name.includes(keyword) && name.endsWith(ext))
  if (!file) throw new Error(`找不到文件：${keyword}${ext}`)
  return path.join(root, file)
}

function splitText(text, source) {
  return text
    .replace(/\r/g, '')
    .split(/\n+/)
    .map(t => t.trim())
    .filter(t => t.length > 20)
    .map((content, index) => ({
      id: `${source}-${index + 1}`,
      source,
      content
    }))
}

async function buildDocxKnowledge() {
  const scenicDoc = findFile('景点结构化数据集', '.docx')
  const guideDoc = findFile('历史、文化、景点特色', '.docx')

  const scenicText = (await mammoth.extractRawText({ path: scenicDoc })).value
  const guideText = (await mammoth.extractRawText({ path: guideDoc })).value

  const chunks = [
    ...splitText(scenicText, '灵山胜境景点结构化数据集'),
    ...splitText(guideText, '灵山胜境游览指南')
  ]

  const output = `export const documentKnowledge = ${JSON.stringify(chunks, null, 2)}
`

  fs.writeFileSync(
    path.join(root, 'src/data/documentKnowledge.ts'),
    output,
    'utf-8'
  )

  console.log(`已生成 documentKnowledge.ts，共 ${chunks.length} 条`)
}

function buildExcelData() {
  const excelPath = findFile('景点景区旅游数据行为分析数据', '.xlsx')
  const workbook = XLSX.readFile(excelPath)

  const result = {}

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName]
    result[sheetName] = XLSX.utils.sheet_to_json(sheet)
  })

  const output = `export const behaviorData = ${JSON.stringify(result, null, 2)}
`

  fs.writeFileSync(
    path.join(root, 'src/data/behaviorData.ts'),
    output,
    'utf-8'
  )

  console.log('已生成 behaviorData.ts')
}

async function main() {
  await buildDocxKnowledge()
 // buildExcelData()
}

main()