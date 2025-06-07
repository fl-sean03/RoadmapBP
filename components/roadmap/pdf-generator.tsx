import jsPDF from "jspdf"
import { TableData } from "./types"

export const generatePDF = async (roadmap: string) => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Enhanced color palette
    const colors = {
      primary: [100, 115, 140],      // Blue-600
      secondary: [66, 77, 84],   // Indigo-500
      accent: [16, 185, 129],      // Emerald-500
      text: {
        primary: [17, 24, 39],     // Gray-900
        secondary: [55, 65, 81],   // Gray-700
        muted: [107, 114, 128],    // Gray-500
      },
      background: {
        light: [249, 250, 251],    // Gray-50
        accent: [239, 246, 255],   // Blue-50
        success: [236, 253, 245],  // Emerald-50
        warning: [255, 251, 235],  // Amber-50
      },
      border: [229, 231, 235],     // Gray-200
    }

    // Typography settings
    const typography = {
      title: { size: 24, weight: "bold" },
      heading1: { size: 16, weight: "bold" },
      heading2: { size: 12, weight: "bold" },
      heading3: { size: 11, weight: "bold" },
      body: { size: 11, weight: "normal" },
      small: { size: 9, weight: "normal" },
      caption: { size: 8, weight: "normal" },
    }

    // Layout settings
    const layout = {
      margin: 15,
      pageWidth: 210,
      pageHeight: 297,
      contentWidth: 175, // 210 - 40 (margins)
      lineHeight: 6,
      sectionSpacing: 12,
      paragraphSpacing: 8,
    }

    let yPosition = layout.margin
    let isFirstPhase = true;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace = layout.lineHeight) => {
      if (yPosition + requiredSpace > layout.pageHeight - layout.margin) {
        pdf.addPage()
        yPosition = layout.margin
        return true
      }
      return false
    }

    // Helper function to add a decorative header line
    const addHeaderLine = () => {
      pdf.setDrawColor(235, 235, 235)
      pdf.setLineWidth(0.3)
      pdf.line(layout.margin, yPosition, layout.margin + layout.contentWidth, yPosition)
      yPosition += 4
    }

    // Enhanced text function with better styling
    const addText = (
      text: string, 
      style = typography.body, 
      color = colors.text.primary, 
      indent = 0,
      alignment: 'left' | 'center' | 'right' = 'left'
    ) => {
      checkPageBreak()
      pdf.setFont("helvetica", style.weight as any)
      pdf.setFontSize(style.size)
      pdf.setTextColor(color[0], color[1], color[2])

      const splitText = pdf.splitTextToSize(text, layout.contentWidth - indent)
      
      let xPosition = layout.margin + indent
      if (alignment === 'center') {
        xPosition = layout.pageWidth / 2
      } else if (alignment === 'right') {
        xPosition = layout.margin + layout.contentWidth
      }

      pdf.text(splitText, xPosition, yPosition, { align: alignment })
      yPosition += layout.lineHeight * splitText.length
    }

    // Enhanced section header
    const addSectionHeader = (title: string, level: 1 | 2 | 3 = 1) => {
      checkPageBreak(20)
      yPosition += layout.sectionSpacing

      const styles = {
        1: { typography: typography.heading1, color: [30, 41, 59] }, // slate-800
        2: { typography: typography.heading2, color: colors.secondary },
        3: { typography: typography.heading3, color: colors.text.primary },
      }

      const style = styles[level]
      
      // No background for level 1 headers

      addText(title, style.typography, style.color, level === 1 ? 5 : 0)
      
      if (level === 1) {
        addHeaderLine()
      }
      
      yPosition += 4
    }

    // Enhanced executive summary box
    const addExecutiveSummary = (content: string) => {
      checkPageBreak(40)
      
      const padding = 4 // Equal padding top and bottom
      // Dynamically calculate box height based on content
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      const wrappedContent = pdf.splitTextToSize(content, layout.contentWidth - padding * 2 - 15)
      const contentHeight = wrappedContent.length * 6; // 6 is approx line height
      const boxHeight = padding + 6 + contentHeight + padding; // top padding + title + content + bottom padding
      
      // Main background (slate-100: rgb(241,245,249))
      pdf.setFillColor(241, 245, 249)
      pdf.rect(layout.margin, yPosition, layout.contentWidth, boxHeight, "F")
      
      // Left accent border (slate-500: rgb(100,116,139))
      pdf.setFillColor(100, 116, 139)
      pdf.rect(layout.margin, yPosition, 2, boxHeight, "F")
      
      // Icon/Symbol (using text)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(16)
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2])
      pdf.text("", layout.margin + padding, yPosition + 12)
      
      // Title
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(12)
      pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2])
      pdf.text("Executive Summary", layout.margin + padding + 4, yPosition + padding + 4)
      
      // Content
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2])
      pdf.text(wrappedContent, layout.margin + padding + 4, yPosition + padding + 12)
      
      yPosition += boxHeight + layout.sectionSpacing
    }

    // Enhanced bullet points
    const addBulletPoint = (text: string, level = 0) => {
      checkPageBreak()
      const indent = 8 + (level * 12)
      const bullets = ["•", "◦", "▪"]
      const bullet = bullets[Math.min(level, bullets.length - 1)]

      // Draw the bullet with a larger font size and slate-800 color
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(13)
      pdf.setTextColor(30, 41, 59)
      pdf.text(bullet, layout.margin + indent, yPosition)

      // Draw the text with normal size and color
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(typography.body.size)
      pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2])
      const wrappedText = pdf.splitTextToSize(text, layout.contentWidth - indent - 8)
      pdf.text(wrappedText, layout.margin + indent + 8, yPosition)
      
      yPosition += layout.lineHeight * wrappedText.length + 2
    }

    // Enhanced table function
    const addTable = (headers: string[], data: TableData[], title: string) => {
      checkPageBreak(50)
      
      // Table title with icon
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
      pdf.text("" + title, layout.margin, yPosition)
      yPosition += 12
      
      const colWidth = layout.contentWidth / headers.length
      const headerHeight = 12
      const rowHeight = 10
      const cellPadding = 3
      
      // Table header background
      pdf.setFillColor(colors.background.light[0], colors.background.light[1], colors.background.light[2])
      pdf.rect(layout.margin, yPosition, layout.contentWidth, headerHeight, "F")
      
      // Header border
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      pdf.setLineWidth(0.5)
      pdf.rect(layout.margin, yPosition, layout.contentWidth, headerHeight)
      
      // Header text
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2])
      
      headers.forEach((header, index) => {
        const x = layout.margin + index * colWidth + cellPadding
        pdf.text(header, x, yPosition + 8)
        
        // Vertical separators
        if (index > 0) {
          pdf.line(
            layout.margin + index * colWidth, 
            yPosition, 
            layout.margin + index * colWidth, 
            yPosition + headerHeight
          )
        }
      })
      
      yPosition += headerHeight
      
      // Table rows
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(9)
      
      data.forEach((row, rowIndex) => {
        checkPageBreak(rowHeight)
        
        // Alternating row colors
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(252, 252, 252)
          pdf.rect(layout.margin, yPosition, layout.contentWidth, rowHeight, "F")
        }
        
        // Row border
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
        pdf.rect(layout.margin, yPosition, layout.contentWidth, rowHeight)
        
        headers.forEach((header, colIndex) => {
          const cellValue = row[header] || ""
          const x = layout.margin + colIndex * colWidth + cellPadding
          
          // Color coding for status/priority
          if (header.toLowerCase().includes("status") || header.toLowerCase().includes("priority")) {
            if (cellValue.toLowerCase().includes("high") || cellValue.toLowerCase().includes("critical")) {
              pdf.setTextColor(220, 38, 38) // Red
            } else if (cellValue.toLowerCase().includes("medium")) {
              pdf.setTextColor(245, 158, 11) // Orange
            } else if (cellValue.toLowerCase().includes("complete") || cellValue.toLowerCase().includes("done")) {
              pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]) // Green
            } else {
              pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2])
            }
          } else {
            pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2])
          }
          
          const wrappedText = pdf.splitTextToSize(cellValue, colWidth - cellPadding * 2)
          pdf.text(wrappedText[0] || "", x, yPosition + 7) // Only first line to fit
          
          // Vertical separators
          if (colIndex > 0) {
            pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
            pdf.line(
              layout.margin + colIndex * colWidth, 
              yPosition, 
              layout.margin + colIndex * colWidth, 
              yPosition + rowHeight
            )
          }
        })
        
        yPosition += rowHeight
      })
      
      yPosition += layout.sectionSpacing
    }

    // Add document header
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.rect(0, 0, layout.pageWidth, 15, "F")
    
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.setTextColor(255, 255, 255)
    pdf.text("RoadmapBP", layout.pageWidth / 2, 10, { align: "center" })
    
    yPosition = 25

    // Add date
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    addText(`Generated on ${currentDate}`, typography.small, colors.text.muted, 0, 'right')
    yPosition += 10

    // Process the roadmap content
    const lines = roadmap.split("\n")
    let i = 0

    // Skip initial content
    while (i < lines.length) {
      const line = lines[i].trim()
      if (line === "Project Roadmap" || line.startsWith("Certainly!") || line.startsWith("---")) {
        i++
        continue
      }
      break
    }

    while (i < lines.length) {
      const line = lines[i].trim()

      if (!line) {
        yPosition += layout.paragraphSpacing / 2
        i++
        continue
      }

      // Handle Executive Summary
      if (line.toLowerCase() === "executive summary") {
        if (!isFirstPhase) {
          pdf.addPage();
          yPosition = layout.margin;
        }
        isFirstPhase = false;
        i++
        if (i < lines.length) {
          addExecutiveSummary(lines[i].trim())
          i++
        }
        continue
      }

      // Handle Phase Headers
      if (line.toLowerCase().startsWith("phase")) {
        addSectionHeader(line, 1)
        i++
        continue
      }

      // Handle subsection headers
      if (line.endsWith(":") && !line.startsWith("•") && !line.startsWith("-")) {
        addSectionHeader(line.replace(":", ""), 2)
        i++
        continue
      }

      // Handle Key Metrics
      if (line.toLowerCase().includes("key metrics")) {
        addSectionHeader(line, 2)
        i++
        continue
      }

      // Handle bullet points
      if (line.startsWith("•") || line.startsWith("-") || line.match(/^\d+\./)) {
        const bulletText = line.replace(/^[•-]\s*/, "").replace(/^\d+\.\s*/, "")
        addBulletPoint(bulletText)
        i++
        continue
      }

      // Regular paragraphs
      if (line.length > 0) {
        addText(line, typography.body, colors.text.secondary)
        yPosition += layout.paragraphSpacing / 2
      }

      i++
    }

    // Add footer to all pages
    const pageCount = pdf.getNumberOfPages()
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      pdf.setPage(pageNum)
      
      // Footer line
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      pdf.setLineWidth(0.3)
      pdf.line(layout.margin, layout.pageHeight - 15, layout.margin + layout.contentWidth, layout.pageHeight - 15)
      
      // Page number
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2])
      pdf.text(
        `Page ${pageNum} of ${pageCount}`, 
        layout.pageWidth - layout.margin, 
        layout.pageHeight - 8, 
        { align: "right" }
      )
      
      // Document title in footer
      pdf.text("Project Roadmap", layout.margin, layout.pageHeight - 8)
    }

    pdf.save("project-roadmap.pdf")
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}
