"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { saveRoadmap, saveFeedback } from './lib/db-helpers'

// Step 1: Expand minimal input into a detailed project brief
export async function expandBrief(minimalInput: string): Promise<{ expandedBrief: string }> {
  console.log("[expandBrief] Input:", minimalInput)
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `You are an expert project manager and technical architect with deep domain expertise across multiple industries. Your task is to expand the following brief into a comprehensive, detailed project description of at least 300-500 words.

Your output MUST include:
- A detailed project overview with specifics about the domain, scale, and core challenges
- Key objectives and high-level goals (minimum 5, be specific and measurable)
- Stakeholders and their roles (be specific to this industry and project type)
- Potential challenges and risks (be specific to this technology/domain, not generic)
- Strategic considerations (include industry-specific best practices)
- Initial thoughts on project phases (with technical details for each phase)
- Technical architecture decisions (specific technologies, frameworks, languages, services)
- Integration requirements (with specific systems, APIs, or platforms)
- Deployment strategy (specific infrastructure, cloud services, or hosting approaches)

CRITICAL: Your response MUST be deeply tailored to the specific project mentioned. Do NOT generate generic content that could apply to any project. Each section should contain technical specifics that only make sense for THIS PARTICULAR project.

For technology projects, specify actual technologies, tools, frameworks, and architectural patterns.
For business projects, specify actual methodologies, systems, and operational approaches.
For creative projects, specify actual creative approaches, tools, and deliverable formats.

IMPORTANT: Where the brief mentions design or planning, make concrete decisions and specify the actual choices (e.g., name the technology stack, database type, cloud provider, authentication method, etc.). Do not include generic tasks like "Design architecture" or "Choose database"—instead, specify what the architecture and database will be.

Respond as a JSON object with a single field: 'expanded_brief'.
The content should be thorough, technically specific, actionable, and suitable for use as the foundation for a strategic roadmap.`,
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
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const promptString = typeof expandedBrief === 'string' ? expandedBrief : JSON.stringify(expandedBrief);
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `Today's date is: ${today}.
You are an expert project manager and technical architect with deep domain knowledge. Based on the expanded project brief, create a structured roadmap that divides the project into three clear phases. 

For each phase, include:
- Phase Title (be specific, not generic like "Planning Phase" - use industry-specific terminology)
- Start and End Dates (If the user input does not specify a timeline, use future dates starting from next week or next month, and do not use any past dates)
- A detailed and comprehensive list of Tasks with Descriptions. 

CRITICAL TASK INSTRUCTIONS:
1. Each task must be highly SPECIFIC to this exact project - not generic tasks that could apply to any project
2. Each task must include TECHNICAL SPECIFICS - name actual technologies, methods, frameworks, or approaches
3. No task should be vague like "Design architecture" - instead, specify "Implement microservices architecture using AWS Lambda with Node.js for the backend APIs"
4. Each task description should include implementation details and acceptance criteria
5. Tasks should differ substantially between different projects - if your tasks could apply to any project, they are TOO GENERIC
6. Include at least 6-10 tasks per phase, with each task having multiple specific details

Include:
- Suggested Success Metrics (include specific, measurable metrics relevant to this project type)
- Next Steps (with specific handoff criteria and dependencies)

IMPORTANT: NEVER create phases or tasks that are generic templates. Each phase, task, and metric should be uniquely tailored to this specific project's domain, technology choices, and requirements.

The phases should build on each other and account for dependencies. For larger or more complex projects, expand each section as needed to fully capture the scope and detail. Respond in JSON format as { phases: [...] } only.

IMPORTANT: If the user input does not specify a timeline, always use future dates for the phase timeline (e.g., starting from next week or next month). Do not use any past dates in the timeline.`,
    prompt: promptString,
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
  console.log("[generatePhaseMarkdown] Input:", { 
    phase: typeof phase === 'object' ? `[Phase object with title: ${phase.title || 'Unknown'}]` : typeof phase,
    expandedBriefType: typeof expandedBrief,
    expandedBriefPreview: typeof expandedBrief === 'string' ? expandedBrief.substring(0, 100) + '...' : 'Not a string'
  });
  
  // Extract only the essential context from the expanded brief
  // This reduces token usage while keeping the important context
  let contextForPhase = "";
  try {
    if (typeof expandedBrief === 'string') {
      // Try to extract key sections if it looks like JSON
      if (expandedBrief.trim().startsWith('{')) {
        try {
          const briefObj = JSON.parse(expandedBrief);
          contextForPhase = `Project Overview: ${briefObj.project_overview || ''}\n` +
            `Key Objectives: ${Array.isArray(briefObj.key_objectives_and_high_level_goals) ? 
              briefObj.key_objectives_and_high_level_goals.join('; ') : 
              (briefObj.key_objectives_and_high_level_goals || '')}\n` +
            `Strategic Considerations: ${Array.isArray(briefObj.strategic_considerations) ? 
              briefObj.strategic_considerations.join('; ') : 
              (briefObj.strategic_considerations || '')}\n` +
            `Technical Architecture: ${briefObj.technical_architecture || briefObj.technical_architecture_decisions || ''}`;
        } catch (e) {
          // If JSON parsing fails, use a substring
          contextForPhase = expandedBrief.substring(0, 1000) + '...';
        }
      } else {
        // Not JSON, use a substring
        contextForPhase = expandedBrief.substring(0, 1000) + '...';
      }
    } else if (typeof expandedBrief === 'object' && expandedBrief !== null) {
      // If it's already an object, extract key parts
      const briefObj = expandedBrief as any;
      contextForPhase = `Project Overview: ${briefObj.project_overview || ''}\n` +
        `Key Objectives: ${Array.isArray(briefObj.key_objectives_and_high_level_goals) ? 
          briefObj.key_objectives_and_high_level_goals.join('; ') : 
          (briefObj.key_objectives_and_high_level_goals || '')}\n` +
        `Strategic Considerations: ${Array.isArray(briefObj.strategic_considerations) ? 
          briefObj.strategic_considerations.join('; ') : 
          (briefObj.strategic_considerations || '')}\n` +
        `Technical Architecture: ${briefObj.technical_architecture || briefObj.technical_architecture_decisions || ''}`;
    }
  } catch (error) {
    console.error("[generatePhaseMarkdown] Error processing expanded brief:", error);
    // Fallback to a simple string
    contextForPhase = "See phase details below.";
  }
  
  // Ensure phase is properly formatted for the prompt
  const phaseForPrompt = typeof phase === 'string' ? phase : JSON.stringify(phase);
  
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `Today's date is: ${today}.
You are an expert project manager and technical architect with deep expertise in this specific domain. Generate detailed, technically precise markdown content for this phase of the project. Use the provided project context as essential background information.

CRITICAL: Your output MUST be uniquely tailored to this specific project's domain, technologies, and requirements. DO NOT produce generic content that could apply to any project. Every section must contain technical specifics relevant ONLY to this particular project.

Your output MUST follow this exact format and structure:

## Phase [Number]: [Phase Title]

### Executive Summary

[3-6 sentences summarizing the focus, goals, and approach for this phase. Include specific technical approaches and methodologies unique to this project.]

### Timeline

2 to 3 sentences describing the timeline for this phase.

* **Start Date**: [Start Date]
* **End Date**: [End Date]

---

### Objectives

2 to 3 sentences describing the objectives for this phase. and include the specific bullet points:

* [Specific, measurable objective with technical details]
* [Specific, measurable objective with technical details]
* [Add more objectives as needed, don't stick to the 3 objectives - be specific to this project]

---

### Tasks

#### 1. [Specific Task Title with Technical Details]

[Detailed task description with implementation specifics]

* [Specific subtask with technical implementation details]
* [Specific subtask with technical implementation details]
* [Specific subtask with technical implementation details]
* [Add more subtasks as needed, don't stick to the 3 subtasks - be specific to this project]

#### 2. [Specific Task Title with Technical Details]

[Detailed task description with implementation specifics]

* [Specific subtask with technical implementation details]
* [Specific subtask with technical implementation details]
* [Add more subtasks as needed, don't stick to the 3 subtasks - be specific to this project]

[Include as many detailed tasks as needed for this phase. At least 5-8 tasks are required for this phase.]

---

### Success Metrics

3 to 4 sentences describing the success metrics for this phase.

* [Specific, measurable metric relevant to this project]
* [Specific, measurable metric relevant to this project]
* [Specific, measurable metric relevant to this project]
* [Specific, measurable metric relevant to this project]
* [Add more success metrics as needed, don't stick to the 3 success metrics - be specific to this project]

---

### Strategic Considerations

* [Project-specific consideration with technical implications]
* [Project-specific consideration with technical implications]
* [Project-specific consideration with technical implications]
* [Add more strategic considerations as needed, don't stick to the 3 strategic considerations - be specific to this project]

---

### Next Steps

[Describe what will happen after this phase concludes, including specific handoffs, follow-ups, or preparations for the next phase. Include technical dependencies and transition criteria.]

---

IMPORTANT REQUIREMENTS:
1. Every task, objective, and metric MUST be specific to this exact project's domain and technology
2. Include detailed technical implementation specifics in each task
3. DO NOT use generic project management language that could apply to any project
4. Tasks should describe HOW something will be done, not just WHAT will be done
5. Success metrics should be specific and measurable for this particular project type
6. If this is a technology project, specify actual technologies, languages, frameworks, and architectural approaches
7. Include domain-specific terminology relevant to this project's industry

IMPORTANT: If the input does not specify a timeline, use future dates for the phase timeline (starting from next week or next month). Do not use any past dates in the timeline.`,
    prompt: `Phase Details:\n${phaseForPrompt}\n\nProject Context:\n${contextForPhase}`,
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
  console.log("[generatePhaseMarkdown] Output:", { 
    markdownLength: markdown.length,
    executiveSummaryLength: executiveSummary.length
  });
  return { markdown, executiveSummary };
}

// Orchestrator: Full roadmap generation
export async function generateFullRoadmap(minimalInput: string): Promise<{
  expandedBrief: string,
  phases: any[],
  markdowns: string[],
  executiveSummaries: string[],
  id?: string,
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

    // Save the roadmap to Supabase
    console.log("[generateFullRoadmap] Attempting to save to Supabase...")
    const saveData = {
      userInput: minimalInput,
      expandedBrief,
      phases,
      markdowns,
      executiveSummaries,
    };
    console.log("[generateFullRoadmap] Save data prepared", { 
      inputLength: minimalInput.length,
      expandedBriefType: typeof expandedBrief,
      phasesCount: phases.length,
      markdownsCount: markdowns.length 
    });
    
    try {
      const savedRoadmap = await saveRoadmap(saveData);
      console.log("[generateFullRoadmap] Supabase save result:", savedRoadmap ? "Success" : "Failed");
      
      console.log("[generateFullRoadmap] Done. Returning result.")
      return { 
        expandedBrief, 
        phases, 
        markdowns, 
        executiveSummaries,
        id: savedRoadmap?.id,
      }
    } catch (saveError) {
      console.error("[generateFullRoadmap] Error saving to Supabase:", saveError);
      // Continue and return the roadmap even if saving failed
      return { expandedBrief, phases, markdowns, executiveSummaries };
    }
  } catch (error) {
    console.error("[generateFullRoadmap] Error:", error)
    throw error
  }
}

// Save user feedback
export async function saveFeedbackAction({
  roadmapId,
  sentiment,
  email,
}: {
  roadmapId?: string;
  sentiment: 'up' | 'down';
  email?: string;
}) {
  try {
    console.log("[saveFeedbackAction] Starting to save feedback")
    
    const result = await saveFeedback({
      roadmapId,
      sentiment,
      email
    })
    
    return { success: !!result, id: result?.id }
  } catch (error) {
    console.error("[saveFeedbackAction] Error:", error)
    return { success: false, error: String(error) }
  }
}
