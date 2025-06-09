"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Step 1: Expand minimal input into a detailed project brief
export async function expandBrief(minimalInput: string): Promise<{ expandedBrief: string }> {
  console.log("[expandBrief] Input:", minimalInput)
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `You are an expert project manager. Expand on the following brief and generate a comprehensive, detailed project description of at least 200 words.\n\nYour output MUST include:\n- A detailed project overview\n- Key objectives and high-level goals\n- Stakeholders and their roles\n- Potential challenges and risks\n- Strategic considerations\n- Initial thoughts on how to break the project into phases (with a sentence or two for each phase)\n- Any other relevant context for a professional roadmap\n\nRespond as a JSON object with a single field: \'expanded_brief\'.\nThe content should be thorough, actionable, and suitable for use as the foundation for a strategic roadmap.`,
    prompt: minimalInput,
  })
  let expandedBrief = response.text
  try {
    const parsed = JSON.parse(response.text)
    if (parsed.expanded_brief) expandedBrief = parsed.expanded_brief
  } catch {}
  console.log("[expandBrief] Output:", expandedBrief)
  return { expandedBrief }
}

// Step 2: Generate structured JSON with 3 phases
export async function generatePhases(expandedBrief: string): Promise<{ phases: any[] }> {
  console.log("[generatePhases] Input:", expandedBrief)
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `You are an expert project manager. Based on the expanded project brief, create a structured roadmap that divides the project into three clear phases. For each phase, include:\n- Phase Title\n- Start and End Dates\n- A detailed and comprehensive list of Tasks with Descriptions (include as many tasks as are necessary to fully capture the scope of the phase; do NOT limit the number of tasks for larger or more complex projects)\n- Suggested Success Metrics (include as many metrics as are relevant for measuring the success of the phase)\n- Next Steps\n\nThe phases should build on each other and account for dependencies. For larger or more complex projects, expand each section as needed to fully capture the scope and detail. Respond in JSON format as { phases: [...] } only.`,
    prompt: expandedBrief,
  })
  let phases: any[] = []
  try {
    const parsed = JSON.parse(response.text)
    if (parsed.phases) phases = parsed.phases
  } catch {}
  console.log("[generatePhases] Output:", phases)
  return { phases }
}

// Step 3: Generate markdown for each phase
export async function generatePhaseMarkdown(phase: any, expandedBrief: string): Promise<{ markdown: string, executiveSummary: string }> {
  console.log("[generatePhaseMarkdown] Input:", { phase, expandedBrief })
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `You are an expert project manager. Generate markdown content for this phase of a project. Use the expanded project brief as additional context.\n\nYour output MUST follow this exact format and structure for each phase:\n\n## Phase [Number]: [Phase Title]\n\n### Executive Summary\n\n[2-6 sentences summarizing the focus, goals, and approach for this phase.]\n\n### Timeline\n\nThis phase will run for [duration], from **[Start Date] to [End Date]**.\n\n* **Start Date**: [Start Date]\n* **End Date**: [End Date]\n\n---\n\n### Objectives\n\nThis phase will achieve the following:\n\n* [Objective 1]\n* [Objective 2]\n* [Objective 3]\n* [Objective 4]\n\n---\n\n### Tasks\n\n#### 1. [Task Title]\n\n[Task description]\n\n* [Subtask or detail]\n* [Subtask or detail]\n* [Subtask or detail]\n\n#### 2. [Task Title]\n\n[Task description]\n\n* [Subtask or detail]\n* [Subtask or detail]\n\n[Repeat for all tasks]\n\n---\n\n### Success Metrics\n\nSuccess for this phase will be evaluated using both qualitative and quantitative benchmarks:\n\n* [Metric 1]\n* [Metric 2]\n* [Metric 3]\n* [Metric 4]\n\n---\n\n### Strategic Considerations\n\n* [Consideration 1]\n* [Consideration 2]\n* [Consideration 3]\n\n---\n\n### Next Steps\n\n[Describe what will happen after this phase concludes, including handoffs, follow-ups, or preparations for the next phase.]\n\n---\n\nStrictly follow this structure, use markdown headers and bullet points as shown, and be as detailed and actionable as possible, leveraging both the phase JSON and the expanded brief.\n\nIMPORTANT: Do NOT limit the number of objectives, tasks, success metrics, or strategic considerations. For larger or more complex projects, include as many items in each section as are necessary to fully capture the scope and detail of the phase. Expand each section as needed based on the project's complexity.`,
    prompt: JSON.stringify({ expandedBrief, phase }),
  })
  const markdown = response.text;
  // Extract executive summary from markdown
  let executiveSummary = "";
  const execMatch = markdown.match(/### Executive Summary\s*([\s\S]*?)\n###/);
  if (execMatch && execMatch[1]) {
    executiveSummary = execMatch[1].trim();
  } else {
    // fallback: try to get everything after Executive Summary header
    const execAlt = markdown.split("### Executive Summary")[1];
    if (execAlt) {
      executiveSummary = execAlt.split("###")[0].trim();
    }
  }
  console.log("[generatePhaseMarkdown] Output:", { markdown, executiveSummary });
  return { markdown, executiveSummary };
}

// Orchestrator: Full roadmap generation
export async function generateFullRoadmap(minimalInput: string): Promise<{
  expandedBrief: string,
  phases: any[],
  markdowns: string[],
  executiveSummaries: string[],
}> {
  try {
    console.log("[generateFullRoadmap] Starting full roadmap generation")
    const { expandedBrief } = await expandBrief(minimalInput)
    const { phases } = await generatePhases(expandedBrief)
    const markdowns: string[] = []
    const executiveSummaries: string[] = []
    for (let idx = 0; idx < phases.length; idx++) {
      console.log(`[generateFullRoadmap] Generating markdown for phase ${idx + 1}`)
      const { markdown, executiveSummary } = await generatePhaseMarkdown(phases[idx], expandedBrief)
      markdowns.push(markdown)
      executiveSummaries.push(executiveSummary)
    }
    console.log("[generateFullRoadmap] Done. Returning result.")
    return { expandedBrief, phases, markdowns, executiveSummaries }
  } catch (error) {
    console.error("[generateFullRoadmap] Error:", error)
    throw error
  }
}
