"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateRoadmap(projectBrief: string): Promise<{
  roadmap: string
}> {
  try {
    const response = await generateText({
      model: openai("gpt-4.1-nano-2025-04-14"),
      system: `You are an expert project manager. Create a focused project roadmap with three distinct phases. Each phase MUST follow this exact format with no deviations:

Executive Summary
[2-3 sentences describing the focus and goals of this specific phase. Sentence starts with "This phase focuses on"]

Phase [Number]: [Name] ([Start Month] - [End Month] don't include the year)
• [Key objective or deliverable]
• [Key objective or deliverable]
• [Key objective or deliverable]
• [Key objective or deliverable]
• [Resource requirement]
• [Resource requirement]

---
Key Metrics & Resources
• [Specific metric for this phase]
• [Specific resource or tool needed]
• [Timeline-based metric]

[Repeat exactly this format for Phase 2 and Phase 3]

Important rules:
1. MUST include all three phases with identical formatting
2. MUST include Executive Summary for EACH phase (Phase 1, Phase 2, Phase 3)
3. MUST include date range in phase title
4. MUST separate Key Metrics with "---"
5. MUST use bullet points (•) for all lists
6. MUST make content specific to the project brief
7. NO additional text or sections allowed
8. NO tables or other formatting
9. NO notes or disclaimers
10. Phase dates should be collected from the project brief, if not provided, use the future date from today's date of 1 month from the current date
11. CRITICAL: EVERY phase MUST have its own Executive Summary section`,
      prompt: `Based on this project brief, create a three-phase roadmap with each phase following the exact format specified:

${projectBrief}

Remember:
- Each phase MUST have its own Executive Summary section before the Phase title
- Phase 1, Phase 2, and Phase 3 must ALL have executive summaries
- Keep all content specific to the project
- Use realistic date ranges across 3-4 months
- Follow the format exactly as specified
- Ensure all three phases are complete with identical structure`,
    })

    return {
      roadmap: response.text
    }
  } catch (error) {
    console.error("Error generating roadmap:", error)
    throw new Error("Failed to generate roadmap. Please try again.")
  }
}
