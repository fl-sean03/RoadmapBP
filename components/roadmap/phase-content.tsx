"use client"

import { FormattedContentItem } from "./types"

interface PhaseContentProps {
  items: FormattedContentItem[]
  theme?: string
}

export const PhaseContent = ({ items, theme }: PhaseContentProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No content available for this phase
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${theme === "dark" ? "text-slate-300" : "text-gray-900"}`}>
      {items.map((item: FormattedContentItem, index: number) => {
        if (item.type === "text") {
          return (
            <div
              key={index}
              className={`${item.className || ""} ${
                theme === "dark" ? "text-slate-300" : "text-gray-900"
              }`}
            >
              {item.content}
            </div>
          )
        } else if (item.type === "milestone-table" || item.type === "risk-table") {
          return (
            <div key={index} className="my-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {item.headers.map((header: string, idx: number) => (
                      <th 
                        key={idx}
                        className="text-left p-2 border-b border-gray-200 dark:border-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.data.map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx}>
                      {row.map((cell: string, cellIdx: number) => (
                        <td 
                          key={cellIdx}
                          className="p-2 border-b border-gray-200 dark:border-gray-700"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return null
      })}
    </div>
  )
} 