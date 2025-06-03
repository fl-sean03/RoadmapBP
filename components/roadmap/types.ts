export interface RoadmapDisplayProps {
  roadmap: string
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