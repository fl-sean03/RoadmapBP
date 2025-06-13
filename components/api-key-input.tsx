"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Key } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ApiKeyInputProps {
  apiKey: string
  setApiKey: (value: string) => void
  className?: string
}

export const ApiKeyInput = ({ apiKey, setApiKey, className }: ApiKeyInputProps) => {
  const [showApiKey, setShowApiKey] = useState(false)
  
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey)
  }
  
  const isValidApiKey = apiKey.startsWith('sk-') && apiKey.length > 20
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <Label htmlFor="api-key" className="text-sm font-medium">
          OpenAI API Key
        </Label>
        {apiKey && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            isValidApiKey ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          )}>
            {isValidApiKey ? "Valid format" : "Invalid format"}
          </span>
        )}
      </div>
      
      <div className="flex">
        <div className="relative flex-grow">
          <Input
            id="api-key"
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={toggleShowApiKey}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Your API key is required to generate the roadmap. It will not be stored on our servers.
      </p>
    </div>
  )
} 