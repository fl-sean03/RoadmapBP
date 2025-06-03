"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateRoadmap(projectBrief: string): Promise<{
  roadmap1: string
  roadmap2: string
  roadmap3: string
}> {
  try {
    const [roadmap1, roadmap2, roadmap3] = await Promise.all([
      generateText({
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

Format the roadmap in a clear, structured manner with proper headings, bullet points, and actionable items. Make it professional and comprehensive enough to guide actual project execution.

Important: Create this as a unique roadmap with its own distinct approach, timeline, and strategy. Do not mention that this is one of three versions.`,
        prompt: `Create a detailed project roadmap for the following project brief:

${projectBrief}

Please provide a comprehensive roadmap that covers all aspects of project planning and execution.`,
      }),
      generateText({
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

Format the roadmap in a clear, structured manner with proper headings, bullet points, and actionable items. Make it professional and comprehensive enough to guide actual project execution.

Important: Create this as a unique roadmap with its own distinct approach, timeline, and strategy. Do not mention that this is one of three versions.`,
        prompt: `Create a detailed project roadmap for the following project brief:

${projectBrief}

Please provide a comprehensive roadmap that covers all aspects of project planning and execution.`,
      }),
      generateText({
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

Format the roadmap in a clear, structured manner with proper headings, bullet points, and actionable items. Make it professional and comprehensive enough to guide actual project execution.

Important: Create this as a unique roadmap with its own distinct approach, timeline, and strategy. Do not mention that this is one of three versions.`,
        prompt: `Create a detailed project roadmap for the following project brief:

${projectBrief}

Please provide a comprehensive roadmap that covers all aspects of project planning and execution.`,
      }),
    ])

    return {
      roadmap1: roadmap1.text,
      roadmap2: roadmap2.text,
      roadmap3: roadmap3.text,
    }
  } catch (error) {
    console.error("Error generating roadmap:", error)
    throw new Error("Failed to generate roadmap. Please try again.")
  }
}
