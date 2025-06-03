import { Circle, Clock } from "lucide-react"
import { FormattedContentItem, TableParseResult } from "./types"
import { parseTableData } from "./utils"
import { MilestoneTable, RiskTable } from "./tables"

export const formatRoadmapContent = (roadmap: string): FormattedContentItem[] => {
  const lines = roadmap.split("\n")
  const formattedContent: FormattedContentItem[] = []
  let i = 0

  // Skip the initial title and introduction
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
      formattedContent.push({
        type: "text",
        content: "",
        className: "h-4",
      })
      i++
      continue
    }

    // Check for tables
    if (
      line.toLowerCase().includes("milestone") &&
      (line.includes("|") || lines[i + 1]?.includes("|") || lines[i + 2]?.includes("|"))
    ) {
      const { data, headers, endIndex } = parseTableData(roadmap, i)
      if (data.length > 0 && headers.length > 0) {
        formattedContent.push({
          type: "milestone-table",
          data,
          headers,
        })
      }
      i = endIndex
      continue
    }

    if (
      line.toLowerCase().includes("risk") &&
      (line.includes("|") || lines[i + 1]?.includes("|") || lines[i + 2]?.includes("|"))
    ) {
      const { data, headers, endIndex } = parseTableData(roadmap, i)
      if (data.length > 0 && headers.length > 0) {
        formattedContent.push({
          type: "risk-table",
          data,
          headers,
        })
      }
      i = endIndex
      continue
    }

    // Handle headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      formattedContent.push({
        type: "text",
        content: text,
        className: `text-${level === 1 ? "3xl" : level === 2 ? "2xl" : "xl"} font-bold text-gray-900`,
      })
      i++
      continue
    }

    // Handle bold text
    if (line.match(/^\*\*.*\*\*:?$/) || line.match(/^[A-Z][^:]*:$/)) {
      const text = line.replace(/\*\*/g, "").replace(/:$/, "")
      formattedContent.push({
        type: "text",
        content: text,
        className: "text-lg font-semibold text-blue-600",
      })
      i++
      continue
    }

    // Handle list items
    if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
      const text = line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "")
      formattedContent.push({
        type: "text",
        content: `• ${text}`,
        className: "ml-4",
      })
      i++
      continue
    }

    // Handle phase indicators
    if (line.match(/^(Phase|Step|Stage)\s+\d+/i)) {
      formattedContent.push({
        type: "text",
        content: line,
        className: "text-lg font-semibold text-blue-600 border-l-4 border-blue-600 pl-4 bg-blue-50 py-2",
      })
      i++
      continue
    }

    // Handle timeline indicators
    if (line.match(/\b\d+\s*(weeks?|months?|days?)\b/i)) {
      formattedContent.push({
        type: "text",
        content: `⏱ ${line}`,
        className: "text-gray-500",
      })
      i++
      continue
    }

    // Regular paragraphs
    if (line.length > 0) {
      formattedContent.push({
        type: "text",
        content: line,
        className: "text-gray-700",
      })
    }

    i++
  }

  return formattedContent
} 