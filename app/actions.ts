"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateRoadmap(projectBrief: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4.1-nano-2025-04-14"),
      system: `You are an expert project manager and strategic planner. Create comprehensive, actionable project roadmaps that include:

1. Executive Summary
2. Project Overview & Objectives
3. Detailed Phase Breakdown with:
   - Phase objectives
   - Key deliverables
   - Timeline estimates
   - Resource requirements
   - Dependencies
4. Milestone Schedule
5. Risk Assessment & Mitigation
6. Success Metrics & KPIs
7. Resource Allocation
8. Communication Plan
9. Quality Assurance Strategy
10. Next Steps & Recommendations

Format the roadmap in a clear, structured manner with proper headings, bullet points, and actionable items. Make it professional and comprehensive enough to guide actual project execution.`,
      prompt: `Create a detailed project roadmap for the following project brief:

${projectBrief}

Please provide a comprehensive roadmap that covers all aspects of project planning and execution.`,
    })

    return text
  } catch (error) {
    console.error("Error generating roadmap:", error)
    throw new Error("Failed to generate roadmap. Please try again.")
  }
}
