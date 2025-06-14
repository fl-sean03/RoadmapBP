"use client"

import { useState, useEffect } from "react"
import { generateFullRoadmap } from "./actions"
import { RoadmapDisplay } from "@/components/roadmap-display"
import { InputSection } from "@/components/input-section"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, XCircle, Key } from "lucide-react"
import React from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [projectBrief, setProjectBrief] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [roadmap, setRoadmap] = useState<{
    expandedBrief: string
    phases: any[]
    markdowns: string[]
    executiveSummaries: string[]
    id?: string
  } | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [dbSaveStatus, setDbSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { toast } = useToast()
  
  // Error handling
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [errorTitle, setErrorTitle] = useState("")
  
  // API Key prompt dialog
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")
  const [apiKeyAction, setApiKeyAction] = useState<"text" | "file" | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)

  // Dynamic steps for loading state
  const [steps, setSteps] = useState<string[]>(["Thinking", "Expanding Brief", "Generating Phases", "Formatting Output"]);
  const [currentStep, setCurrentStep] = useState(0); // 0-based index

  // Show toast notification when database save status changes
  useEffect(() => {
    if (dbSaveStatus === 'success') {
      toast({
        title: "Saved to database",
        description: "Your roadmap has been saved for future reference",
        variant: "default",
      })
    } else if (dbSaveStatus === 'error') {
      toast({
        title: "Database error",
        description: "Could not save your roadmap to the database. Check console for details.",
        variant: "destructive",
      })
    }
  }, [dbSaveStatus, toast])

  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorDialog(true);
  }

  const validateApiKey = () => {
    if (!apiKey.trim()) {
      // Show API key dialog
      setShowApiKeyDialog(true);
      return false;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showError(
        "Invalid API Key", 
        "Your API key appears to be invalid. OpenAI API keys should start with 'sk-'. Please check your API key and try again."
      );
      return false;
    }
    
    return true;
  }
  
  const handleApiKeySubmit = () => {
    if (!tempApiKey.trim()) {
      showError(
        "API Key Required", 
        "Please enter your OpenAI API key to generate a roadmap."
      );
      return;
    }
    
    if (!tempApiKey.startsWith('sk-')) {
      showError(
        "Invalid API Key", 
        "Your API key appears to be invalid. OpenAI API keys should start with 'sk-'. Please check your API key and try again."
      );
      return;
    }
    
    // Update the main API key
    setApiKey(tempApiKey);
    
    // Close the dialog
    setShowApiKeyDialog(false);
    
    // Execute the appropriate action based on what was requested
    if (apiKeyAction === "text" && projectBrief.trim()) {
      // Use the new API key directly
      handleTextSubmitInternal();
    } else if (apiKeyAction === "file" && fileContent) {
      // Use the new API key directly
      handleFileContentInternal(fileContent);
    }
    
    // Reset
    setApiKeyAction(null);
    setFileContent(null);
  }

  const handleTextSubmit = async () => {
    if (!projectBrief.trim()) {
      showError("Empty Input", "Please enter a project description to generate a roadmap.");
      return;
    }
    
    // If no API key, show dialog and set action type
    if (!validateApiKey()) {
      setApiKeyAction("text");
      return;
    }

    handleTextSubmitInternal();
  }
  
  const handleTextSubmitInternal = async () => {
    setIsGenerating(true)
    setCurrentStep(0)
    setDbSaveStatus('idle')
    setSteps(["Thinking", "Expanding Brief", "Generating Phases", "Formatting Output"]); // Static steps
    
    try {
      // Step 1: Thinking (simulate)
      setCurrentStep(0)
      await new Promise(res => setTimeout(res, 500))
      
      // Step 2: Expanding Brief
      setCurrentStep(1)
      const { expandedBrief } = await import("./actions").then(m => m.expandBrief(projectBrief, apiKey))
      
      // Step 3: Generating Phases
      setCurrentStep(2)
      const { phases } = await import("./actions").then(m => m.generatePhases(expandedBrief, apiKey))
      
      // Step 4: Formatting Output (generating markdowns for all phases)
      setCurrentStep(3)
      const markdowns: string[] = []
      const executiveSummaries: string[] = []
      for (let idx = 0; idx < phases.length; idx++) {
        const { markdown, executiveSummary } = await import("./actions").then(m => m.generatePhaseMarkdown(phases[idx], expandedBrief, idx + 1, apiKey))
        markdowns.push(markdown)
        executiveSummaries.push(executiveSummary)
      }
      
      // Save to Database (no loading step)
      const saveData = {
        userInput: projectBrief,
        expandedBrief,
        phases,
        markdowns,
        executiveSummaries,
      }
      const savedRoadmap = await import("./lib/db-helpers").then(m => m.saveRoadmap(saveData))
      setRoadmap({ expandedBrief, phases, markdowns, executiveSummaries, id: savedRoadmap?.id })
      setDbSaveStatus(savedRoadmap?.id ? 'success' : 'error')
    } catch (error: any) {
      console.error("Error generating roadmap:", error)
      setDbSaveStatus('error')
      
      // Handle specific API errors
      if (error.message?.includes('API key is required')) {
        showError(
          "API Key Required", 
          "You must provide your own OpenAI API key to generate a roadmap."
        );
      } else if (error.message?.includes('401')) {
        showError(
          "API Key Error", 
          "Your OpenAI API key was rejected. Please check that you've entered a valid API key with sufficient credits."
        );
      } else if (error.message?.includes('429')) {
        showError(
          "Rate Limit Exceeded", 
          "You've reached the rate limit for the OpenAI API. Please wait a moment before trying again or check your usage tier."
        );
      } else if (error.message?.includes('insufficient_quota')) {
        showError(
          "Insufficient Credits", 
          "Your OpenAI account has insufficient credits. Please add credits to your account and try again."
        );
      } else {
        showError(
          "Generation Error", 
          "An error occurred while generating your roadmap. Please check your API key and try again."
        );
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileContent = async (content: string) => {
    // If no API key, show dialog and store content
    if (!validateApiKey()) {
      setApiKeyAction("file");
      setFileContent(content);
      return;
    }

    handleFileContentInternal(content);
  }
  
  const handleFileContentInternal = async (content: string) => {
    setIsGenerating(true)
    setCurrentStep(0)
    setDbSaveStatus('idle')
    setSteps(["Thinking", "Expanding Brief", "Generating Phases", "Formatting Output"]); // Static steps
    
    try {
      // Step 1: Thinking (simulate)
      setCurrentStep(0)
      await new Promise(res => setTimeout(res, 500))
      
      // Step 2: Expanding Brief
      setCurrentStep(1)
      const { expandedBrief } = await import("./actions").then(m => m.expandBrief(content, apiKey))
      
      // Step 3: Generating Phases
      setCurrentStep(2)
      const { phases } = await import("./actions").then(m => m.generatePhases(expandedBrief, apiKey))
      
      // Step 4: Formatting Output (generating markdowns for all phases)
      setCurrentStep(3)
      const markdowns: string[] = []
      const executiveSummaries: string[] = []
      for (let idx = 0; idx < phases.length; idx++) {
        const { markdown, executiveSummary } = await import("./actions").then(m => m.generatePhaseMarkdown(phases[idx], expandedBrief, idx + 1, apiKey))
        markdowns.push(markdown)
        executiveSummaries.push(executiveSummary)
      }
      
      // Save to Database (no loading step)
      const saveData = {
        userInput: content,
        expandedBrief,
        phases,
        markdowns,
        executiveSummaries,
      }
      const savedRoadmap = await import("./lib/db-helpers").then(m => m.saveRoadmap(saveData))
      setRoadmap({ expandedBrief, phases, markdowns, executiveSummaries, id: savedRoadmap?.id })
      setDbSaveStatus(savedRoadmap?.id ? 'success' : 'error')
    } catch (error: any) {
      console.error("Error generating roadmap:", error)
      setDbSaveStatus('error')
      
      // Handle specific API errors
      if (error.message?.includes('API key is required')) {
        showError(
          "API Key Required", 
          "You must provide your own OpenAI API key to generate a roadmap."
        );
      } else if (error.message?.includes('401')) {
        showError(
          "API Key Error", 
          "Your OpenAI API key was rejected. Please check that you've entered a valid API key with sufficient credits."
        );
      } else if (error.message?.includes('429')) {
        showError(
          "Rate Limit Exceeded", 
          "You've reached the rate limit for the OpenAI API. Please wait a moment before trying again or check your usage tier."
        );
      } else if (error.message?.includes('insufficient_quota')) {
        showError(
          "Insufficient Credits", 
          "Your OpenAI account has insufficient credits. Please add credits to your account and try again."
        );
      } else {
        showError(
          "Generation Error", 
          "An error occurred while generating your roadmap. Please check your API key and try again."
        );
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 lg:px-0 px-3">
      <Navbar />

      {/* Main Content */}
      <main className="lg:max-w-[85vw] max-w-[95vw] mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="lg:text-4xl text-2xl font-bold mb-2">Generate a roadmap for your project</h1>
          <p className="text-muted-foreground">Create a roadmap for your project with AI</p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto">
          <InputSection
            projectBrief={projectBrief}
            setProjectBrief={setProjectBrief}
            apiKey={apiKey}
            setApiKey={setApiKey}
            isGenerating={isGenerating}
            onTextSubmit={handleTextSubmit}
            onFileContent={handleFileContent}
          />
        </div>

        {/* Output Section */}
        {(roadmap || isGenerating) && (
          <div className="mt-8 max-w-4xl mx-auto">
            <RoadmapDisplay roadmap={roadmap} isGenerating={isGenerating} steps={steps} currentStep={currentStep} />
          </div>
        )}
      </main>
      
      {/* Error Dialog */}
      <AlertDialog 
        open={showErrorDialog} 
        onOpenChange={(open) => {
          setShowErrorDialog(open);
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              {errorTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-700 dark:text-slate-300">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* API Key Dialog */}
      <Dialog 
        open={showApiKeyDialog} 
        onOpenChange={(open) => {
          setShowApiKeyDialog(open);
        }}
      >
        <DialogContent className="max-w-[95%] md:w-[600px] w-full mx-auto p-4 md:p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center lg:text-lg text-base gap-2 text-blue-600">
              <Key className="lg:h-5 lg:w-5 h-4 w-4" />
              OpenAI API Key Required
            </DialogTitle>
            <DialogDescription className="text-base text-slate-700 dark:text-slate-300">
              <p className="mb-4 lg:text-base text-sm text-left">
                To generate your roadmap, please provide your OpenAI API key. Your key will not be stored on our servers.
              </p>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  You can find your API key in the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI dashboard</a>.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setShowApiKeyDialog(false);
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              setApiKey(tempApiKey);
              setShowApiKeyDialog(false);
            }}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
