export interface RoadmapDisplayProps {
  roadmap?: {
    roadmap: string
  }
  isGenerating: boolean
}

export interface TableData {
  [key: string]: string
}

export interface TableParseResult {
  data: TableData[]
  headers: string[]
  endIndex: number
}

export interface FormattedContentItem {
  type: "text" | "milestone-table" | "risk-table"
  content?: string
  className?: string
  data?: TableData[]
  headers?: string[]
} 