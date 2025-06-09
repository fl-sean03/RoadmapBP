import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

interface PhaseCardProps {
  phase: number
  selectedPhase: number
  onSelect: (phase: number) => void
}

export const PhaseCard = ({ phase, selectedPhase, onSelect }: PhaseCardProps) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedPhase === phase ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(phase)}
    >
      <CardHeader className="flex lg:flex-row flex-col items-center gap-0.5">
        <div className="lg:p-2 p-1 rounded-lg bg-primary/10">
          <Target className="lg:h-5 lg:w-5 h-4 w-4" />
        </div>
        <div>
          <CardTitle className="lg:text-lg text-base">Phase {phase}</CardTitle>
          <CardDescription className="hidden lg:block">Click to view this phase</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
} 