"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, CheckCircle, Loader2 } from "lucide-react"

interface LoadingStateProps {
  steps: string[]
  currentStep: number
}

export const LoadingState = ({ steps, currentStep }: LoadingStateProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calculate progress percentage
    const progressPercentage = (currentStep / (steps.length - 1)) * 100
    setProgress(progressPercentage)
  }, [currentStep, steps.length])

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 shadow-xl">
      <CardHeader className="flex-none pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex lg:justify-start justify-center items-center gap-2 lg:text-xl text-lg font-bold">
              <Target className="lg:h-5 lg:w-5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h1 className="lg:text-left text-center">Generating Roadmap</h1>
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 lg:text-base text-sm text-center">
              AI is crafting your project roadmap. This may take a while...
            </CardDescription>
          </div>
          <div className="lg:text-base text-sm font-medium text-blue-600 dark:text-blue-400">{Math.round(progress)}%</div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center lg:py-8 py-6 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative flex items-center lg:p-4 p-3 rounded-lg transition-all duration-300
                ${idx === currentStep
                  ? "bg-blue-100/80 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800 shadow-sm"
                  : idx < currentStep
                    ? "bg-green-100/80 dark:bg-green-900/30"
                    : "bg-slate-100 dark:bg-slate-800"}
              `}
            >
              <div className="mr-4">
                {idx < currentStep ? (
                  <div className="flex items-center justify-center lg:w-10 lg:h-10 w-7 h-7 rounded-full bg-green-200 dark:bg-green-800 ring-4 ring-green-100 dark:ring-green-900">
                    <CheckCircle className="lg:w-5 lg:h-5 w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                ) : idx === currentStep ? (
                  <div className="flex items-center justify-center lg:w-10 lg:h-10 w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-800 ring-4 ring-blue-100 dark:ring-blue-900 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 dark:border-blue-500 border-dashed animate-[spin_3s_linear_infinite]" />
                    <Loader2 className="lg:w-5 lg:h-5 w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center lg:w-10 lg:h-10 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 ring-4 ring-slate-100 dark:ring-slate-900">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{idx + 1}</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`lg:text-base text-sm font-medium ${
                    idx === currentStep
                      ? "text-blue-700 dark:text-blue-300"
                      : idx < currentStep
                        ? "text-green-700 dark:text-green-300"
                        : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step}
                </p>

                {idx === currentStep && (
                  <div className="mt-1 flex space-x-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"
                      style={{ animationDelay: "600ms" }}
                    ></span>
                  </div>
                )}
              </div>

              {idx < currentStep && (
                <span className="text-xs text-green-600 dark:text-green-400 ml-2 font-medium">Completed</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
