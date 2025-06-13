"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { saveRoadmap, saveFeedback } from './lib/db-helpers'

// Step 1: Expand minimal input into a detailed project brief
export async function expandBrief(minimalInput: string): Promise<{ expandedBrief: string }> {
  console.log("[expandBrief] Input:", minimalInput)
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `You are an expert project manager. A stakeholder has provided this brief idea:\n\n"${minimalInput}"\n\nUsing only that input, generate a lean project brief (≈500 words) for the minimal viable product.\n\nYour output MUST include:\n1. Must-Have Features & Scope (only the essentials)\n2. Actionable Tasks & Timeline (step-by-step build plan)\n3. Roles & Resources (who does what and when)\n4. Validation & Success Metrics (how to test MVP with real users)\n5. Next Steps (3 immediate action items to start development)\n\nCRITICAL: Focus SOLELY on building the minimal MVP—nothing theoretical or overly technical.\n- Zero in on must-have features only\n- List concrete tasks and milestones (not vague goals)\n- Avoid deep technical minutiae (no code snippets or hyperparam tuning)\n- Outline just enough roles, timeline, and validation to get a working prototype in front of users.\n\nRespond as a JSON object with a single field: 'expanded_brief'.\nThe content should be concise, actionable, and suitable as a practical foundation for a lean MVP roadmap.`,
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
You are an expert project manager. Use the following three-phase template to structure the roadmap. Always hyper-tailor each phase's activities and deliverables to the specifics of the user's idea or project—focus on concrete, actionable insights that directly move toward the MVP or next milestone.

---

Phase 1: Define & Plan
Goal: Nail down what you're doing, why it matters, and how you'll measure success.
• Key Activities:
  • Clarify vision & objectives in user-centric terms
  • Identify stakeholders, roles, and required resources
  • Outline scope (what's in vs. out) with absolute must-haves
  • Set clear success metrics and a high-level timeline
• Deliverables:
  • One-page Project Charter (purpose, goals, scope, metrics)
  • Resource & role matrix with assignments
  • Draft schedule with 3–5 concrete milestones

---

Phase 2: Execute & Deliver
Goal: Build or implement the core solution, get it into users' hands, and validate it works.
• Key Activities:
  • Break work into prioritized tasks or sprints tied to success metrics
  • Develop/integrate the MVP features only—no extras
  • Conduct basic testing or user validation on each release
  • Deploy or launch a first usable version to real users
• Deliverables:
  • Working Minimum Viable Product/Service/Feature
  • Feedback report with specific user comments and quantified issues
  • Initial usage or performance dashboard

---

Phase 3: Evaluate & Grow
Goal: Leverage real-world insights to improve, expand, and scale sustainably.
• Key Activities:
  • Analyze data against your predefined success metrics
  • Iterate on the highest-impact features or fixes first
  • Optimize cost, quality, and delivery speed based on real metrics
  • Plan next-phase enhancements or new customer segments
• Deliverables:
  • Lessons-learned & performance analysis document
  • Prioritized roadmap for Version 2+ with deadlines
  • Growth plan outlining marketing, partnership, or upsell tactics

---

How to Use:
1. Start by inserting the specific project or idea at the top.
2. Customize each bullet with concrete tasks, dates, and people.
3. Focus on the smallest set of actions that deliver real value—and iterate fast.

CRITICAL INSTRUCTIONS:
- You MUST hyper-tailor the response to the user's input.
- For each phase, provide: Name, Goal, Key Activities, and Deliverables.
- Customize each bullet point with concrete tasks, dates, people, and metrics relevant to THIS project.
- Do not use generic placeholders.
- Respond in JSON format as { phases: [...] } only.`,
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
export async function generatePhaseMarkdown(phase: any, expandedBrief: string, phaseIndex?: number): Promise<{ markdown: string, executiveSummary: string }> {
  console.log("[generatePhaseMarkdown] Input:", { 
    phase: typeof phase === 'object' ? `[Phase object with title: ${phase.title || 'Unknown'}]` : typeof phase,
    expandedBriefType: typeof expandedBrief,
    expandedBriefPreview: typeof expandedBrief === 'string' ? expandedBrief.substring(0, 100) + '...' : 'Not a string',
    phaseIndex
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
  
  // Add explicit phase number instruction if provided
  const phaseNumberInstruction = phaseIndex !== undefined 
    ? `\n\nIMPORTANT: This is Phase ${phaseIndex}. Make sure to use exactly "Phase ${phaseIndex}" in the title.` 
    : '';
  
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const response = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `Today's date is: ${today}.
You are an expert project manager. Generate actionable, detailed markdown content for this phase of building the MVP, following the structure below. Hyper-tailor every point to the specifics of the project—focus on specific actionable insights. Do not include generic or theoretical details.

Your output MUST follow this exact format and structure:

## Phase [Number]: [Phase Title] (Timeline)

### Goal
[2-4 sentences describing the main goal of this phase, hyper-tailored to the project's MVP.]

### Key Activities
* [A concrete activity or task specific to this project]
* [A concrete activity or task specific to this project]
* [Add more activities as needed, all specific to this MVP phase. Don't stick to the 3 activities - be specific to this project]

### Deliverables
* [A specific deliverable for this phase, relevant to this project]
* [A specific deliverable for this phase, relevant to this project]
* [Add more deliverables as needed. Don't stick to the 3 deliverables - be specific to this project]

### Next Steps
* [An immediate action item to start development or move to the next phase]
* [An immediate action item]
* [An immediate action item]

IMPORTANT:
- Every item must be hyper-tailored to this specific project and its MVP.
- Do not include generic or placeholder content.
- Keep the output practical, and focused on measurable progress.`,
    prompt: `Phase Details:\n${phaseForPrompt}\n\nProject Context:\n${contextForPhase}${phaseNumberInstruction}`,
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
      const { markdown, executiveSummary } = await generatePhaseMarkdown(phases[idx], expandedBrief, idx + 1)
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
