import { Circle, Clock } from "lucide-react"
import { parseTableData } from "./utils"
import { MilestoneTable, RiskTable } from "./tables"

export const formatRoadmapContent = (content: string) => {
  const lines = content.split("\n")
  const formattedContent = []
  let listItems = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line) {
      if (listItems.length > 0) {
        formattedContent.push(
          <ul key={`list-${i}`} className="space-y-2 ml-4 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>,
        )
        listItems = []
      }
      formattedContent.push(<div key={`space-${i}`} className="h-4" />)
      i++
      continue
    }

    // Check for milestone or risk assessment tables
    if (
      line.toLowerCase().includes("milestone") &&
      (line.includes("|") || lines[i + 1]?.includes("|") || lines[i + 2]?.includes("|"))
    ) {
      if (listItems.length > 0) {
        formattedContent.push(
          <ul key={`list-before-milestone-${i}`} className="space-y-2 ml-4 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>,
        )
        listItems = []
      }

      const { data, headers, endIndex } = parseTableData(content, i)
      if (data.length > 0 && headers) {
        formattedContent.push(<MilestoneTable key={i} data={data} headers={headers} />)
      }
      i = endIndex
      continue
    }

    if (
      line.toLowerCase().includes("risk") &&
      (line.includes("|") || lines[i + 1]?.includes("|") || lines[i + 2]?.includes("|"))
    ) {
      if (listItems.length > 0) {
        formattedContent.push(
          <ul key={`list-before-risk-${i}`} className="space-y-2 ml-4 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>,
        )
        listItems = []
      }

      const { data, headers, endIndex } = parseTableData(content, i)
      if (data.length > 0 && headers) {
        formattedContent.push(<RiskTable key={i} data={data} headers={headers} />)
      }
      i = endIndex
      continue
    }

    // Main headings (##, ###, etc.)
    const headingMatch = line.match(/^#{1,3}\s+/)
    if (headingMatch) {
      if (listItems.length > 0) {
        formattedContent.push(
          <ul key={`list-before-${i}`} className="space-y-2 ml-4 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>,
        )
        listItems = []
      }

      const level = headingMatch[0].length
      const text = line.replace(/^#+\s+/, "")

      if (level === 1) {
        formattedContent.push(
          <h1 key={i} className="text-2xl font-bold text-primary mb-4 pb-2 border-b border-border">
            {text}
          </h1>,
        )
      } else if (level === 2) {
        formattedContent.push(
          <h2 key={i} className="text-xl font-semibold text-foreground mb-3 mt-6">
            {text}
          </h2>,
        )
      } else {
        formattedContent.push(
          <h3 key={i} className="text-lg font-medium text-foreground mb-2 mt-4">
            {text}
          </h3>,
        )
      }
      i++
      continue
    }

    // Bold text patterns
    if (line.match(/^\*\*.*\*\*:?$/) || line.match(/^[A-Z][^:]*:$/)) {
      if (listItems.length > 0) {
        formattedContent.push(
          <ul key={`list-before-bold-${i}`} className="space-y-2 ml-4 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>,
        )
        listItems = []
      }

      const text = line.replace(/\*\*/g, "").replace(/:$/, "")
      formattedContent.push(
        <h4 key={i} className="font-semibold text-primary mb-2 mt-4">
          {text}
        </h4>,
      )
      i++
      continue
    }

    // List items (-, *, •, numbers)
    if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
      const text = line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "")
      listItems.push(text)
      i++
      continue
    }

    // Phase or step indicators
    if (line.match(/^(Phase|Step|Stage)\s+\d+/i)) {
      if (listItems.length > 0) {
        formattedContent.push(
          <ul key={`list-before-phase-${i}`} className="space-y-2 ml-4 mb-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0" />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>,
        )
        listItems = []
      }

      formattedContent.push(
        <div key={i} className="bg-primary/5 border-l-4 border-primary p-4 mb-4 rounded-r-lg">
          <h3 className="font-semibold text-primary mb-2">{line}</h3>
        </div>,
      )
      i++
      continue
    }

    // Timeline indicators
    if (line.match(/\b\d+\s*(weeks?|months?|days?)\b/i)) {
      formattedContent.push(
        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Clock className="h-4 w-4" />
          <span>{line}</span>
        </div>,
      )
      i++
      continue
    }

    // Regular paragraphs
    if (line.length > 0 && listItems.length === 0) {
      formattedContent.push(
        <p key={i} className="text-sm leading-relaxed mb-3 text-muted-foreground">
          {line}
        </p>,
      )
    }

    i++
  }

  // Handle remaining list items
  if (listItems.length > 0) {
    formattedContent.push(
      <ul key="final-list" className="space-y-2 ml-4 mb-4">
        {listItems.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Circle className="h-2 w-2 mt-2 text-primary flex-shrink-0" />
            <span className="text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>,
    )
  }

  return formattedContent
} 