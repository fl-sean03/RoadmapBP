"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { generateRoadmap } from "./actions"
import { RoadmapDisplay } from "@/components/roadmap-display"
import React from "react"
import { InputSection } from "@/components/input-section"

export default function Home() {
  const [projectBrief, setProjectBrief] = useState("")
  const [roadmap, setRoadmap] = useState<{
    roadmap1: string
    roadmap2: string
    roadmap3: string
  } | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure component is mounted before showing theme toggle
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleTextSubmit = async () => {
    if (!projectBrief.trim()) return

    setIsGenerating(true)
    try {
      const result = await generateRoadmap(projectBrief)
      setRoadmap(result)
    } catch (error) {
      console.error("Error generating roadmap:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileContent = async (content: string) => {
    setIsGenerating(true)
    try {
      const result = await generateRoadmap(content)
      setRoadmap(result)
    } catch (error) {
      console.error("Error generating roadmap:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="lg:text-3xl text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                RoadmapBP
              </h1>
              <p className="lg:text-muted-foreground lg:text-sm text-xs">Transform your project ideas into actionable roadmaps</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <InputSection
            projectBrief={projectBrief}
            setProjectBrief={setProjectBrief}
            isGenerating={isGenerating}
            onTextSubmit={handleTextSubmit}
            onFileContent={handleFileContent}
          />

          

          {/* Output Section */}
          <div className="space-y-6">
            <RoadmapDisplay roadmap={roadmap} isGenerating={isGenerating} />
          </div>
        </div>
      </div>
    </div>
  )
}
