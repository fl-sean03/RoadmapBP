import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, ISectionOptions } from "docx"
import { TableData } from "./types"
import { parseTableData } from "./utils"

export const generateDOCX = async (roadmap: string) => {
  try {
    const sections: ISectionOptions[] = []
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
          sections.push({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "• ",
                    bold: true,
                  }),
                  new TextRun({
                    text: item,
                  }),
                ],
                spacing: {
                  after: 200,
                },
              }),
            ],
          })
        })
        listItems = []
      }
    }

    while (i < lines.length) {
      const line = lines[i].trim()

      if (!line) {
        flushListItems()
        sections.push({
          children: [
            new Paragraph({
              spacing: {
                after: 200,
              },
            }),
          ],
        })
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
          const table = new Table({
            rows: [
              new TableRow({
                children: headers.map(
                  (header) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: header,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      shading: {
                        fill: "F2F2F2",
                      },
                      width: {
                        size: 100 / headers.length,
                        type: "pct",
                      },
                      margins: {
                        top: 150,
                        bottom: 150,
                        left: 80,
                        right: 80,
                      },
                    }),
                ),
              }),
              ...data.map(
                (row) =>
                  new TableRow({
                    children: headers.map((header) => {
                      const cellText = row[header] || ""
                      return new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: cellText,
                                color: header.toLowerCase().includes("status") || header.toLowerCase().includes("priority")
                                  ? cellText.toLowerCase().includes("high")
                                    ? "DC2626"
                                    : cellText.toLowerCase().includes("medium")
                                      ? "F59E0B"
                                      : cellText.toLowerCase().includes("complete")
                                        ? "22C55E"
                                        : "6B7280"
                                  : "000000",
                                bold: header.toLowerCase().includes("status") || header.toLowerCase().includes("priority"),
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              line: 360,
                            },
                          }),
                        ],
                        width: {
                          size: 100 / headers.length,
                          type: "pct",
                        },
                        margins: {
                          top: 200,
                          bottom: 200,
                          left: 200,
                          right: 200,
                        },
                      })
                    }),
                  }),
              ),
            ],
            width: {
              size: 100,
              type: "pct",
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            margins: {
              top: 400,
              bottom: 400,
              left: 400,
              right: 400,
            },
          })

          sections.push({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Project Milestones",
                    bold: true,
                    size: 28,
                    color: "0066CC",
                  }),
                ],
                spacing: {
                  after: 400,
                },
              }),
              table,
            ],
          })
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
          const table = new Table({
            rows: [
              new TableRow({
                children: headers.map(
                  (header) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: header,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      shading: {
                        fill: "F2F2F2",
                      },
                      width: {
                        size: 100 / headers.length,
                        type: "pct",
                      },
                      margins: {
                        top: 200,
                        bottom: 200,
                        left: 200,
                        right: 200,
                      },
                    }),
                ),
              }),
              ...data.map(
                (row) =>
                  new TableRow({
                    children: headers.map((header) => {
                      const cellText = row[header] || ""
                      return new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: cellText,
                                color: header.toLowerCase().includes("impact") || header.toLowerCase().includes("probability")
                                  ? cellText.toLowerCase().includes("high")
                                    ? "DC2626"
                                    : cellText.toLowerCase().includes("medium")
                                      ? "F59E0B"
                                      : "22C55E"
                                  : header.toLowerCase().includes("status")
                                    ? cellText.toLowerCase().includes("mitigated")
                                      ? "22C55E"
                                      : "6B7280"
                                    : "000000",
                                bold: header.toLowerCase().includes("impact") || header.toLowerCase().includes("probability") || header.toLowerCase().includes("status"),
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              line: 360,
                            },
                          }),
                        ],
                        width: {
                          size: 100 / headers.length,
                          type: "pct",
                        },
                        margins: {
                          top: 200,
                          bottom: 200,
                          left: 200,
                          right: 200,
                        },
                      })
                    }),
                  }),
              ),
            ],
            width: {
              size: 100,
              type: "pct",
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            margins: {
              top: 400,
              bottom: 400,
              left: 400,
              right: 400,
            },
          })

          sections.push({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Risk Assessment",
                    bold: true,
                    size: 28,
                    color: "F97316",
                  }),
                ],
                spacing: {
                  after: 400,
                },
              }),
              table,
            ],
          })
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

        sections.push({
          children: [
            new Paragraph({
              text,
              heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
              spacing: {
                after: 400,
              },
            }),
          ],
        })
        i++
        continue
      }

      // Handle bold text
      if (line.match(/^\*\*.*\*\*:?$/) || line.match(/^[A-Z][^:]*:$/)) {
        flushListItems()
        const text = line.replace(/\*\*/g, "").replace(/:$/, "")

        sections.push({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: true,
                  color: "0066CC",
                  size: 24,
                }),
              ],
              spacing: {
                after: 300,
              },
            }),
          ],
        })
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

        sections.push({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  bold: true,
                  color: "0066CC",
                  size: 24,
                }),
              ],
              spacing: {
                after: 300,
              },
              border: {
                left: {
                  color: "0066CC",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              shading: {
                fill: "F0F8FF",
              },
            }),
          ],
        })
        i++
        continue
      }

      // Handle timeline indicators
      if (line.match(/\b\d+\s*(weeks?|months?|days?)\b/i)) {
        sections.push({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `⏱ ${line}`,
                  color: "6B7280",
                  size: 20,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
          ],
        })
        i++
        continue
      }

      // Regular paragraphs
      if (line.length > 0 && listItems.length === 0) {
        sections.push({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  color: "3C3C3C",
                }),
              ],
              spacing: {
                after: 200,
              },
            }),
          ],
        })
      }

      i++
    }

    // Flush any remaining list items
    flushListItems()

    // Create the document with all sections
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections.flatMap(section => section.children || []),
        },
      ],
    })

    // Generate and download the document
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