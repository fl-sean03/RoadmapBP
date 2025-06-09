import jsPDF from "jspdf"
import { TableData } from "./types"
import { marked } from "marked"

// Recursive function to render tokens
function renderTokens(tokens: any[], pdf: any, addText: any, yPositionRef: { y: number }, layout: any, typography: any, colors: any, indent = 0) {
  for (const token of tokens) {
    if (token.type === 'heading') {
      let style = typography.heading1
      if (token.depth === 2) style = typography.heading2
      if (token.depth === 3) style = typography.heading3
      addText(token.text, style, colors.text.primary, indent, 'left', layout.lineHeight + 2)
      yPositionRef.y += 2
    } else if (token.type === 'paragraph') {
      addText(token.text, typography.body, colors.text.secondary, indent, 'left', layout.lineHeight)
      yPositionRef.y += 2
    } else if (token.type === 'list') {
      for (const item of token.items) {
        // Only render the first paragraph or text as the bullet
        const firstText = item.tokens?.find((t: any) => t.type === 'text' || t.type === 'paragraph');
        if (firstText) {
          addText('• ' + firstText.text, typography.body, colors.text.primary, indent + 4, 'left', layout.lineHeight);
        }
        // Render any nested tokens (except the first text/paragraph)
        if (item.tokens && item.tokens.length > 1) {
          const restTokens = item.tokens.filter((t: any, i: number) => i !== item.tokens.findIndex((tt: any) => tt.type === 'text' || tt.type === 'paragraph'));
          if (restTokens.length > 0) {
            renderTokens(restTokens, pdf, addText, yPositionRef, layout, typography, colors, indent + 8);
          }
        }
      }
      yPositionRef.y += 2;
    } else if (token.type === 'space') {
      yPositionRef.y += layout.lineHeight / 2
    } else if (token.type === 'hr') {
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      pdf.setLineWidth(0.3)
      pdf.line(layout.margin, yPositionRef.y, layout.margin + layout.contentWidth, yPositionRef.y)
      yPositionRef.y += 6
    } else if (token.type === 'text') {
      addText(token.text, typography.body, colors.text.secondary, indent, 'left', layout.lineHeight)
    } else if (token.type === 'blockquote') {
      addText(token.text, typography.body, colors.text.muted, indent + 8, 'left', layout.lineHeight)
      yPositionRef.y += 2
    }
    // You can add more token types (tables, code, etc.) as needed
  }
}

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

    // Typography settings (adjusted for better hierarchy)
    const typography = {
      title: { size: 24, weight: "bold" },
      heading1: { size: 12, weight: "bold" }, // Phase title (bigger)
      heading2: { size: 16, weight: "bold" }, // Section headers (medium)
      heading3: { size: 14, weight: "bold" }, // Task titles (smaller)
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
    const yPositionRef = { y: yPosition }

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace = layout.lineHeight) => {
      if (yPositionRef.y + requiredSpace > layout.pageHeight - layout.margin) {
        pdf.addPage()
        yPositionRef.y = layout.margin
        return true
      }
      return false
    }

    // Helper function to add text with style
    const addText = (
      text: string,
      style = typography.body,
      color = colors.text.primary,
      indent = 0,
      alignment: 'left' | 'center' | 'right' = 'left',
      spacing = layout.lineHeight
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
      pdf.text(splitText, xPosition, yPositionRef.y, { align: alignment })
      yPositionRef.y += spacing * splitText.length
    }

    // Add document header
    pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
    pdf.rect(0, 0, layout.pageWidth, 15, "F")
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.setTextColor(255, 255, 255)
    pdf.text("RoadmapBP", layout.pageWidth / 2, 10, { align: "center" })
    yPositionRef.y = 25

    // Add date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    addText(`Generated on ${currentDate}`, typography.small, colors.text.muted, 0, 'right')
    yPositionRef.y += 10

    // Parse markdown using marked
    const tokens = marked.lexer(roadmap)
    renderTokens(tokens, pdf, addText, yPositionRef, layout, typography, colors)

    // Add footer to all pages
    const pageCount = pdf.getNumberOfPages()
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      pdf.setPage(pageNum)
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2])
      pdf.setLineWidth(0.3)
      pdf.line(layout.margin, layout.pageHeight - 15, layout.margin + layout.contentWidth, layout.pageHeight - 15)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2])
      pdf.text(
        `Page ${pageNum} of ${pageCount}`,
        layout.pageWidth - layout.margin,
        layout.pageHeight - 8,
        { align: "right" }
      )
      pdf.text("Project Roadmap", layout.margin, layout.pageHeight - 8)
    }

    pdf.save("project-roadmap.pdf")
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}
