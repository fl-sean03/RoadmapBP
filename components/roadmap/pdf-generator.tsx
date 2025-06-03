import jsPDF from "jspdf"
import { TableData } from "./types"
import { parseTableData } from "./utils"

export const generatePDF = async (roadmap: string) => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set up fonts and colors
    pdf.setFont("helvetica", "normal")
    
    let yPosition = 20
    const margin = 20
    const pageWidth = 210 - margin * 2
    const pageHeight = 297
    const lineHeight = 6

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace = lineHeight) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
    }

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize = 11, fontStyle = "normal", color = [0, 0, 0], indent = 0) => {
      checkPageBreak()
      pdf.setFont("helvetica", fontStyle)
      pdf.setFontSize(fontSize)
      pdf.setTextColor(color[0], color[1], color[2])

      const splitText = pdf.splitTextToSize(text, pageWidth - indent)
      pdf.text(splitText, margin + indent, yPosition)
      yPosition += lineHeight * splitText.length
    }

    // Helper function to add a table
    const addTable = (headers: string[], data: TableData[], title: string) => {
      checkPageBreak(30) // Reserve space for table header

      // Add table title
      addText(title, 14, "bold", [0, 100, 200])
      yPosition += 5

      // Calculate column widths
      const colWidth = pageWidth / headers.length
      const minRowHeight = 10 // Increased from 8
      const cellPadding = 4 // Increased from 2
      const lineSpacing = 5 // Added line spacing

      // Draw table headers
      checkPageBreak(minRowHeight)
      pdf.setFillColor(240, 240, 240)
      pdf.rect(margin, yPosition - 5, pageWidth, minRowHeight, "F")

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)

      headers.forEach((header, index) => {
        const x = margin + index * colWidth + cellPadding
        const wrappedHeader = pdf.splitTextToSize(header, colWidth - cellPadding * 2)
        pdf.text(wrappedHeader, x, yPosition)
      })
      yPosition += minRowHeight

      // Draw table rows
      pdf.setFont("helvetica", "normal")
      data.forEach((row, rowIndex) => {
        // Calculate the height needed for this row
        let maxCellHeight = minRowHeight
        const cellContents: string[][] = []

        headers.forEach((header, colIndex) => {
          const cellText = row[header] || ""
          const wrappedText = pdf.splitTextToSize(cellText, colWidth - cellPadding * 2)
          cellContents[colIndex] = wrappedText
          const cellHeight = Math.max(minRowHeight, wrappedText.length * lineSpacing + cellPadding * 2)
          maxCellHeight = Math.max(maxCellHeight, cellHeight)
        })

        checkPageBreak(maxCellHeight)

        // Draw row background
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(margin, yPosition - 5, pageWidth, maxCellHeight, "F")
        }

        // Draw cell borders
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.1)

        headers.forEach((header, colIndex) => {
          const x = margin + colIndex * colWidth

          // Draw vertical cell border
          pdf.line(x, yPosition - 5, x, yPosition - 5 + maxCellHeight)

          // Draw cell content
          const cellText = row[header] || ""
          const textX = x + cellPadding
          const textY = yPosition + cellPadding // Added padding to top of cell

          // Handle special formatting for status and priority columns
          if (header.toLowerCase().includes("status") || header.toLowerCase().includes("priority")) {
            pdf.setFont("helvetica", "bold")
            if (cellText.toLowerCase().includes("high")) {
              pdf.setTextColor(220, 38, 38) // Red
            } else if (cellText.toLowerCase().includes("medium")) {
              pdf.setTextColor(245, 158, 11) // Orange
            } else if (cellText.toLowerCase().includes("complete")) {
              pdf.setTextColor(34, 197, 94) // Green
            } else {
              pdf.setTextColor(107, 114, 128) // Gray
            }
          } else {
            pdf.setFont("helvetica", "normal")
            pdf.setTextColor(0, 0, 0)
          }

          // Add wrapped text with proper vertical alignment
          const wrappedText = cellContents[colIndex]
          wrappedText.forEach((line, lineIndex) => {
            pdf.text(line, textX, textY + lineIndex * lineSpacing)
          })
        })

        // Draw right border for last column
        pdf.line(margin + pageWidth, yPosition - 5, margin + pageWidth, yPosition - 5 + maxCellHeight)

        // Draw horizontal border for this row
        pdf.line(margin, yPosition - 5 + maxCellHeight, margin + pageWidth, yPosition - 5 + maxCellHeight)

        yPosition += maxCellHeight
      })

      // Draw top border of the table (after headers)
      pdf.line(
        margin,
        yPosition - data.length * minRowHeight - minRowHeight - 5,
        margin + pageWidth,
        yPosition - data.length * minRowHeight - minRowHeight - 5,
      )

      yPosition += 10 // Add space after table
    }

    // Process the roadmap content
    const lines = roadmap.split("\n")
    let i = 0
    let listItems: string[] = []

    // Skip the initial title and introduction
    while (i < lines.length) {
      const line = lines[i].trim()
      if (line === "Project Roadmap" || line.startsWith("Certainly!") || line.startsWith("---")) {
        i++
        continue
      }
      break
    }

    const flushListItems = () => {
      if (listItems.length > 0) {
        listItems.forEach((item) => {
          addText(`• ${item}`, 11, "normal", [0, 0, 0], 5)
        })
        listItems = []
        yPosition += 3
      }
    }

    while (i < lines.length) {
      const line = lines[i].trim()

      if (!line) {
        flushListItems()
        yPosition += 3
        i++
        continue
      }

      // Check for tables
      if (
        line.toLowerCase().includes("milestone") &&
        (line.includes("|") || lines[i + 1]?.includes("|") || lines[i + 2]?.includes("|"))
      ) {
        flushListItems()
        const { data, headers, endIndex } = parseTableData(roadmap, i)
        if (data.length > 0 && headers.length > 0) {
          addTable(headers, data, "Project Milestones")
        }
        i = endIndex
        continue
      }

      if (
        line.toLowerCase().includes("risk") &&
        (line.includes("|") || lines[i + 1]?.includes("|") || lines[i + 2]?.includes("|"))
      ) {
        flushListItems()
        const { data, headers, endIndex } = parseTableData(roadmap, i)
        if (data.length > 0 && headers.length > 0) {
          addTable(headers, data, "Risk Assessment")
        }
        i = endIndex
        continue
      }

      // Handle headings
      const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
      if (headingMatch) {
        flushListItems()
        const level = headingMatch[1].length
        const text = headingMatch[2]

        if (level === 1) {
          yPosition += 5
          addText(text, 20, "bold", [0, 100, 200])
          yPosition += 3
        } else if (level === 2) {
          yPosition += 4
          addText(text, 16, "bold", [0, 0, 0])
          yPosition += 2
        } else {
          yPosition += 3
          addText(text, 14, "bold", [0, 0, 0])
          yPosition += 2
        }
        i++
        continue
      }

      // Handle bold text
      if (line.match(/^\*\*.*\*\*:?$/) || line.match(/^[A-Z][^:]*:$/)) {
        flushListItems()
        const text = line.replace(/\*\*/g, "").replace(/:$/, "")
        addText(text, 12, "bold", [0, 100, 200])
        yPosition += 2
        i++
        continue
      }

      // Handle list items
      if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
        const text = line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "")
        listItems.push(text)
        i++
        continue
      }

      // Handle phase indicators
      if (line.match(/^(Phase|Step|Stage)\s+\d+/i)) {
        flushListItems()
        checkPageBreak(15)

        // Add colored background for phases
        pdf.setFillColor(240, 248, 255)
        pdf.rect(margin, yPosition - 3, pageWidth, 12, "F")

        // Add left border
        pdf.setFillColor(0, 100, 200)
        pdf.rect(margin, yPosition - 3, 3, 12, "F")

        addText(line, 12, "bold", [0, 100, 200], 8)
        yPosition += 5
        i++
        continue
      }

      // Handle timeline indicators
      if (line.match(/\b\d+\s*(weeks?|months?|days?)\b/i)) {
        addText(`⏱ ${line}`, 10, "normal", [107, 114, 128])
        i++
        continue
      }

      // Regular paragraphs
      if (line.length > 0 && listItems.length === 0) {
        addText(line, 11, "normal", [60, 60, 60])
        yPosition += 2
      }

      i++
    }

    // Flush any remaining list items
    flushListItems()

    // Add page numbers
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: "right" })
    }

    pdf.save("project-roadmap.pdf")
  } catch (error) {
    console.error("Error generating PDF:", error)
  }
} 