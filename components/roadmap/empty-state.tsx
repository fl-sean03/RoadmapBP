import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

export const EmptyState = () => {
  return (
    <Card className="h-[calc(90vh-8rem)] flex flex-col">
      <CardHeader className="flex-none">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <h1 className="lg:text-xl text-lg">Your Roadmap</h1>
        </CardTitle>
        <CardDescription>Your generated project roadmap will appear here</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="font-medium lg:text-base text-sm">Ready to generate your roadmap</p>
            <p className="lg:text-sm text-xs text-muted-foreground">
              Enter your project details or upload a file to get started
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 