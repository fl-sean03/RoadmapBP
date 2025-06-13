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
You are an expert project manager. Use the following three-phase template to structure the roadmap for this project. For each phase, swap in specifics for the project's domain, team, and goals. Keep the plan lean, actionable, and focused on measurable MVP progress. Do not include generic or theoretical content—make every outcome, activity, and deliverable specific to this project.

---

Phase 1: Discover & Define
Goal: Validate the core idea and lock down exactly what your minimal MVP must deliver.
• Key Outcomes:
  • A one-page "MVP spec" listing only must-have features
  • Clear success metrics (e.g. "User can complete X in under Y seconds")
  • High-level timeline & resource sketch
• Typical Activities:
  • Stakeholder interviews or quick user surveys
  • Competitive research & feature prioritization
  • Drafting acceptance criteria and UX wireframes
  • Identifying data/model needs (if relevant)
• Deliverables:
  • Lean MVP spec document
  • 3–5 immediate action items to kick off build

---

Phase 2: Build & Launch MVP
Goal: Turn that spec into a working prototype, deploy it to real users, and gather feedback.
• Key Outcomes:
  • A functioning MVP with all must-have features
  • Live deployment (beta or soft launch)
  • Initial usage data and qualitative feedback
• Typical Activities:
  • Iterative development sprints (frontend, backend, integrations)
  • Basic QA / user-acceptance testing
  • Simple infrastructure setup (hosting, CI/CD, monitoring)
  • Onboarding first users and collecting metrics
• Deliverables:
  • Deployed MVP accessible to testers
  • Feedback report & bug backlog
  • Performance / usage dashboard

---

Phase 3: Iterate, Optimize & Scale
Goal: Use real-world data to improve the product, expand features, and prepare for growth.
• Key Outcomes:
  • Data-driven feature roadmap
  • Optimized performance/cost profile
  • Growth plan (marketing, partnerships, upsells)
• Typical Activities:
  • A/B tests on key flows and pricing
  • Performance tuning and cost-optimization (caching, autoscaling)
  • UX refinements and secondary features (based on feedback)
  • Marketing campaigns or enterprise outreach
• Deliverables:
  • Roadmap for next quarter
  • Scaled infrastructure and KPI benchmarks
  • Launch plan for version 2 or growth initiatives

---

How to customize:
1. Rename each phase to fit the project's language (e.g. "Prototype & Validate," "Launch & Learn," "Expand & Embed").
2. Adjust timelines and activities to the team size and domain.
3. Plug in concrete tasks and metrics at every step.

INSTRUCTIONS:
- For each phase, provide: Name, Goal, Key Outcomes, Typical Activities, Deliverables.
- Make every item specific to this project and its MVP.
- Do not include generic placeholders—swap in real, actionable details.
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
You are an expert project manager. Generate actionable, concise markdown content for this phase of building the MVP, following the structure below. Use the provided project context as essential background information. Do not include unnecessary technical or theoretical details—focus on concrete, MVP-specific actions and outcomes.

Your output MUST follow this exact format and structure:

## Phase [Number]: [Phase Title]

### Goal
[1-2 sentences describing the main goal of this phase, tailored to the MVP.]

### Key Outcomes
* [Specific, measurable outcome]
* [Specific, measurable outcome]
* [Add more outcomes as needed, all tailored to this project]

### Typical Activities
* [Concrete activity or task]
* [Concrete activity or task]
* [Add more activities as needed, all specific to this MVP phase]

### Deliverables
* [Specific deliverable for this phase]
* [Specific deliverable for this phase]
* [Add more deliverables as needed, all relevant to this project]

### Next Steps
* [Immediate action item to move forward]
* [Immediate action item]
* [Immediate action item]

IMPORTANT:
- Every item must be specific to this project and its MVP.
- Do not include generic or placeholder content—swap in real, actionable details.
- Keep the output concise, practical, and focused on measurable progress.`,
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
