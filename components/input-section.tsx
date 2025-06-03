"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Sparkles } from "lucide-react"
import { FileUpload } from "@/components/file-upload"

interface InputSectionProps {
  projectBrief: string
  setProjectBrief: (value: string) => void
  isGenerating: boolean
  onTextSubmit: () => void
  onFileContent: (content: string) => void
}

export const InputSection = ({
  projectBrief,
  setProjectBrief,
  isGenerating,
  onTextSubmit,
  onFileContent,
}: InputSectionProps) => {
  return (
    <div className="lg:space-y-6 space-y-4">
      <Card className="h-[calc(90vh-8rem)] flex flex-col border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardHeader className="flex-none">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h1 className="lg:text-xl text-lg">Project Brief Input</h1>
          </CardTitle>
          <CardDescription>
            Describe your project or upload a document to generate a comprehensive roadmap
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto custom-scrollbar">
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
                onClick={onTextSubmit}
                disabled={!projectBrief.trim() || isGenerating}
                className="w-full text-white"
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
              <FileUpload onFileContent={onFileContent} isGenerating={isGenerating} />
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
  )
} 