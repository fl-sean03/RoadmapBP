"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Sparkles, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { generateRoadmap } from "./actions"
import { FileUpload } from "@/components/file-upload"
import { RoadmapDisplay } from "@/components/roadmap-display"
import React from "react"

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Roadmap Generator
              </h1>
              <p className="text-muted-foreground">Transform your project ideas into actionable roadmaps</p>
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
          <div className="space-y-6">
            <Card className="h-[calc(90vh-8rem)] flex flex-col border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardHeader className="flex-none">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Brief Input
                </CardTitle>
                <CardDescription>
                  Describe your project or upload a document to generate a comprehensive roadmap
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Text Input</TabsTrigger>
                    <TabsTrigger value="file">File Upload</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-brief">Project Description</Label>
                      <Textarea
                        id="project-brief"
                        placeholder="Describe your project in detail. Include goals, target audience, key features, timeline, and any specific requirements..."
                        value={projectBrief}
                        onChange={(e) => setProjectBrief(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!projectBrief.trim() || isGenerating}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating Roadmap...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Roadmap
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <FileUpload onFileContent={handleFileContent} isGenerating={isGenerating} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What you'll get</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">Detailed project phases and milestones</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">Timeline estimates and dependencies</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">Resource allocation recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">Risk assessment and mitigation strategies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <RoadmapDisplay roadmap={roadmap} isGenerating={isGenerating} />
          </div>
        </div>
      </div>
    </div>
  )
}
