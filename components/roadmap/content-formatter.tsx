import { FormattedContentItem } from "./types"

export const formatRoadmapContent = (roadmap: string): FormattedContentItem[] => {
  if (!roadmap) return [];
  
  const lines = roadmap.split("\n");
  const formattedContent: FormattedContentItem[] = [];
  let inExecutiveSummary = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      continue;
    }
    
    if (trimmedLine.toLowerCase() === "executive summary") {
      inExecutiveSummary = true;
      continue; 
    }
    
    if (trimmedLine.toLowerCase().startsWith("phase")) {
      inExecutiveSummary = false;
    }
    
    if (inExecutiveSummary) {
      formattedContent.push({
        type: "text",
        content: "Executive Summary:",
        className: "executive-summary lg:text-base text-sm font-bold text-gray-900 dark:text-gray-200 bg-[#e5f9f6] dark:bg-[#001f1c] lg:px-4 px-3 lg:pt-4 pt-3 rounded-t border-l-4 border-[#00bfa5]",
      });
      formattedContent.push({
        type: "text",
        content: trimmedLine,
        className: "executive-summary lg:text-base text-sm text-gray-900 dark:text-gray-200 mb-6 bg-[#e5f9f6] dark:bg-[#001f1c] lg:px-4 px-3 lg:pb-4 pb-3 rounded-b border-l-4 border-[#00bfa5] !-mt-0 pt-1 !mb-6",
      });
      continue;
    }
    
    if (trimmedLine.toLowerCase().startsWith("phase")) {
      formattedContent.push({
        type: "text",
        content: trimmedLine,
        className: "phase-header lg:text-2xl text-lg font-bold text-blue-600 mb-6",
      });
      continue;
    }
    
    if (trimmedLine === "---" || trimmedLine.toLowerCase().includes("key metrics")) {
      formattedContent.push({
        type: "text",
        content: "",
        className: " !my-8 !w-full roadmap-metrics-divider",
      });
      
      if (trimmedLine.toLowerCase().includes("key metrics")) {
        formattedContent.push({
          type: "text",
          content: trimmedLine,
          className: "!lg:text-lg !text-base !font-semibold !text-gray-900 dark:!text-gray-200 !mt-6 !mb-2 pt-4 !border-t-[1px] !border-solid !border-gray-200 dark:!border-gray-600",
        });
      }
      continue;
    }
    
    if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.match(/^\d+\./)) {
      const bulletPoint = trimmedLine.replace(/^[•-]\s*/, "").replace(/^\d+\.\s*/, "");
      formattedContent.push({
        type: "text",
        content: `• ${bulletPoint}`,
        className: "lg:ml-4 ml-2 mb-2 lg:text-base text-sm text-gray-700",
      });
      continue;
    }
    
    formattedContent.push({
      type: "text",
      content: trimmedLine,
      className: "lg:text-base text-sm text-gray-700 mb-2",
    });
  }
  
  return formattedContent;
} 