"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

interface RoadmapCardProps {
  title: string
  content: string
  isSelected: boolean
  onClick: () => void
  index: number
}

const RoadmapCard = ({ isSelected, onClick, index }: RoadmapCardProps) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      } flex-1`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Roadmap {index + 1}</CardTitle>
          <CardDescription>Click to view this version</CardDescription>
        </div>
      </CardHeader>
      
    </Card>
  )
}

interface RoadmapCardsProps {
  roadmaps: string[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export const RoadmapCards = ({ roadmaps, selectedIndex, onSelect }: RoadmapCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {roadmaps.map((content, index) => (
        <RoadmapCard
          key={index}
          title={`Roadmap ${index + 1}`}
          content={content}
          isSelected={selectedIndex === index}
          onClick={() => onSelect(index)}
          index={index}
        />
      ))}
    </div>
  )
}
