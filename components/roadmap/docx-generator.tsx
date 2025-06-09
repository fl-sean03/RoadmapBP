import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx"
import { marked } from "marked"

function renderTokens(tokens: any[], docChildren: Paragraph[], indent = 0) {
  for (const token of tokens) {
    if (token.type === 'heading') {
      let fontSize = 16;
      let isBold = true;
      if (token.depth === 2) {
        fontSize = 14;
      } else if (token.depth === 3) {
        fontSize = 12;
      }
      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: token.text, size: fontSize * 2, bold: isBold })],
        })
      )
    } else if (token.type === 'paragraph') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: token.text, size: 22 })], // 11pt * 2
          spacing: { after: 80 },
        })
      )
    } else if (token.type === 'list') {
      for (const item of token.items) {
        // Only render the first paragraph or text as the bullet
        const firstText = item.tokens?.find((t: any) => t.type === 'text' || t.type === 'paragraph');
        if (firstText) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: firstText.text, size: 22 })], // 11pt * 2
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          )
        }
        // Render any nested tokens (except the first text/paragraph)
        if (item.tokens && item.tokens.length > 1) {
          const restTokens = item.tokens.filter((t: any, i: number) => i !== item.tokens.findIndex((tt: any) => tt.type === 'text' || tt.type === 'paragraph'));
          if (restTokens.length > 0) {
            renderTokens(restTokens, docChildren, indent + 1)
          }
        }
      }
    } else if (token.type === 'space') {
      docChildren.push(new Paragraph({ spacing: { after: 40 } }))
    } else if (token.type === 'hr') {
      docChildren.push(new Paragraph({ spacing: { after: 80 } }))
    } else if (token.type === 'text') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: token.text, size: 22 })], // 11pt * 2
          spacing: { after: 80 },
        })
      )
    } else if (token.type === 'blockquote') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: token.text, italics: true, size: 22 })], // 11pt * 2
          spacing: { after: 80 },
          alignment: AlignmentType.LEFT,
        })
      )
    }
    // You can add more token types (tables, code, etc.) as needed
  }
}

export const generateDOCX = async (roadmap: string) => {
  try {
    const docChildren: Paragraph[] = []
    const tokens = marked.lexer(roadmap)
    renderTokens(tokens, docChildren)

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "project-roadmap.docx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error generating DOCX:", error)
  }
} 