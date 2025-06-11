import { supabase } from './supabase';

/**
 * Save a roadmap to the database
 */
export async function saveRoadmap({
  userInput,
  expandedBrief,
  phases,
  markdowns,
  executiveSummaries,
}: {
  userInput: string;
  expandedBrief: any;
  phases: any[];
  markdowns: string[];
  executiveSummaries: string[];
}) {
  try {
    // Add debug logging
    console.log("[saveRoadmap] Starting to save roadmap to Supabase");
    console.log("[saveRoadmap] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[saveRoadmap] Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Create data object for insertion
    const roadmapData = {
      user_input: userInput,
      expanded_brief: expandedBrief,
      phases: phases,
      markdowns: markdowns,
      executive_summaries: executiveSummaries,
    };
    
    console.log("[saveRoadmap] Data prepared for insertion");
    
    const { data, error } = await supabase.from('roadmaps').insert(roadmapData).select();

    if (error) {
      console.error('[saveRoadmap] Error saving roadmap to Supabase:', error);
      console.error('[saveRoadmap] Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('[saveRoadmap] Successfully saved roadmap to Supabase:', data);
    return data[0];
  } catch (error) {
    console.error('[saveRoadmap] Exception saving roadmap to Supabase:', error);
    if (error instanceof Error) {
      console.error('[saveRoadmap] Error message:', error.message);
      console.error('[saveRoadmap] Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Save user feedback to the database
 */
export async function saveFeedback({
  roadmapId,
  sentiment,
  email,
}: {
  roadmapId?: string;
  sentiment: 'up' | 'down';
  email?: string;
}) {
  try {
    console.log("[saveFeedback] Starting to save feedback to Supabase");
    
    // Create data object for insertion
    const feedbackData = {
      roadmap_id: roadmapId || null,
      sentiment,
      email: email || null,
    };
    
    console.log("[saveFeedback] Data prepared for insertion:", feedbackData);
    
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select();

    if (error) {
      console.error('[saveFeedback] Error saving feedback to Supabase:', error);
      console.error('[saveFeedback] Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('[saveFeedback] Successfully saved feedback to Supabase:', data);
    return data[0];
  } catch (error) {
    console.error('[saveFeedback] Exception saving feedback to Supabase:', error);
    if (error instanceof Error) {
      console.error('[saveFeedback] Error message:', error.message);
      console.error('[saveFeedback] Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Get all roadmaps from the database
 */
export async function getAllRoadmaps() {
  try {
    console.log("[getAllRoadmaps] Fetching all roadmaps from Supabase");
    
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getAllRoadmaps] Error fetching roadmaps from Supabase:', error);
      return [];
    }

    console.log(`[getAllRoadmaps] Successfully fetched ${data?.length || 0} roadmaps`);
    return data;
  } catch (error) {
    console.error('[getAllRoadmaps] Exception fetching roadmaps from Supabase:', error);
    return [];
  }
}

/**
 * Get a specific roadmap by ID
 */
export async function getRoadmapById(id: string) {
  try {
    console.log(`[getRoadmapById] Fetching roadmap with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getRoadmapById] Error fetching roadmap from Supabase:', error);
      return null;
    }

    console.log('[getRoadmapById] Successfully fetched roadmap');
    return data;
  } catch (error) {
    console.error('[getRoadmapById] Exception fetching roadmap from Supabase:', error);
    return null;
  }
} 