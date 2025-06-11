"use client"

import type React from "react"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, Mail, CheckCircle, Loader2 } from "lucide-react"
import { saveFeedbackAction } from "@/app/actions"

interface FeedbackProps {
  roadmapId?: string;
}

export const Feedback = ({ roadmapId }: FeedbackProps) => {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleThumb = (type: "up" | "down") => {
    setFeedback(type)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback) {
      setError("Please select thumbs up or down before submitting")
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      // Save feedback using server action
      const result = await saveFeedbackAction({
        roadmapId,
        sentiment: feedback,
        email: email || undefined
      })
      
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err)
      setError("Failed to submit feedback. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mt-8 max-w-full mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 lg:rounded-2xl rounded-xl shadow-md border border-green-200 dark:border-green-800 lg:p-8 p-4 flex flex-col items-center">
          <div className="lg:w-16 lg:h-16 w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle className="lg:w-8 lg:h-8 w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="lg:text-xl text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-green-600 dark:text-green-300 lg:text-base text-sm text-center">
            Your input helps us improve our AI roadmap generator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 max-w-full mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 lg:p-6 p-4 relative overflow-hidden">
       

        <div className="relative z-10">
          <div className="text-center mb-4">
            <h3 className="lg:text-xl text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">How was your experience?</h3>
            <p className="lg:text-sm text-xs text-slate-600 dark:text-slate-400">Your feedback helps us create better roadmaps</p>
          </div>

          <div className="flex justify-center gap-6 mb-6">
            <button
              className={`group relative lg:rounded-2xl rounded-xl lg:p-3 p-2 border-1 transition-all duration-300 transform hover:scale-105 ${
                feedback === "up"
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400 dark:border-green-500 shadow-lg shadow-green-200/50 dark:shadow-green-900/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              }`}
              onClick={() => handleThumb("up")}
              aria-label="Thumbs up"
              type="button"
            >
              <ThumbsUp
                className={`lg:w-7 lg:h-7 w-6 h-6 transition-colors duration-300 ${
                  feedback === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-green-500"
                }`}
              />
              
            </button>

            <button
              className={`group relative lg:rounded-2xl rounded-xl lg:p-3 p-2 border-1 transition-all duration-300 transform hover:scale-105 ${
                feedback === "down"
                  ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-400 dark:border-red-500 shadow-lg shadow-red-200/50 dark:shadow-red-900/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
              onClick={() => handleThumb("down")}
              aria-label="Thumbs down"
              type="button"
            >
              <ThumbsDown
                className={`lg:w-7 lg:h-7 w-6 h-6 transition-colors duration-300 ${
                  feedback === "down"
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-red-500"
                }`}
              />
              
            </button>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center mb-3">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="flex flex-row items-center gap-1 w-full">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 lg:w-5 lg:h-5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  className="w-full lg:pl-11 pl-8 pr-4 lg:py-3 py-2 lg:rounded-xl rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 lg:text-base text-sm dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-transparent transition-all duration-200"
                  placeholder="Your email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitted}
                />
              </div>
              <button
                type="submit"
                className={`lg:py-3 py-2 lg:px-6 px-4 lg:rounded-xl rounded-lg font-semibold text-white lg:text-base text-sm transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:transform-none ml-2 whitespace-nowrap ${
                  feedback === "up"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:ring-green-500 shadow-lg shadow-green-200/50 dark:shadow-green-900/20"
                    : feedback === "down"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 focus:ring-red-500 shadow-lg shadow-red-200/50 dark:shadow-red-900/20"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:ring-blue-500 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20"
                } disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none`}
                disabled={submitting || submitted || !feedback}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>

            {feedback && !error && (
              <div className="mt-3 text-center">
                <p className="lg:text-sm text-xs text-slate-500 dark:text-slate-400">
                  {feedback === "up"
                    ? "Great! We're glad the roadmap was helpful."
                    : "Thanks for letting us know. We'll work on improving it."}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
