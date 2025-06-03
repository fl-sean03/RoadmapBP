import { TableData, TableParseResult } from "./types"

export const parseTableData = (content: string, startIndex: number): TableParseResult => {
  const lines = content.split("\n")
  const tableData: TableData[] = []
  let i = startIndex

  // Skip to the actual table content
  while (i < lines.length && !lines[i].includes("|")) {
    i++
  }

  if (i >= lines.length) return { data: [], headers: [], endIndex: startIndex }

  // Parse table headers
  const headerLine = lines[i].trim()
  if (!headerLine.includes("|")) return { data: [], headers: [], endIndex: startIndex }

  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h)
  i++ // Skip separator line if exists
  if (i < lines.length && lines[i].includes("---")) i++

  // Parse table rows
  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line || !line.includes("|")) break

    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c)
    if (cells.length > 0) {
      const rowData: TableData = {}
      headers.forEach((header, idx) => {
        rowData[header] = cells[idx] || ""
      })
      tableData.push(rowData)
    }
    i++
  }

  return { data: tableData, headers, endIndex: i }
} 