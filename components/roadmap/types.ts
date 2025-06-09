export interface TableItem {
  type: "milestone-table" | "risk-table"
  headers: string[]
  data: string[][]
  className?: string
}

export interface TextItem {
  type: "text"
  content: string
  className?: string
}

export type FormattedContentItem = TextItem | TableItem

export interface RoadmapPhase {
  title: string
  startDate: string
  endDate: string
  tasks: { title: string; description: string }[]
  metrics: string[]
  nextSteps: string
}

export interface RoadmapDisplayProps {
  roadmap?: {
    expandedBrief: string
    phases: RoadmapPhase[]
    markdowns: string[]
    executiveSummaries: string[]
  }
  isGenerating: boolean
  steps?: string[]
  currentStep?: number
}

export interface TableData {
  [key: string]: string
}

export interface TableParseResult {
  data: TableData[]
  headers: string[]
  endIndex: number
} 