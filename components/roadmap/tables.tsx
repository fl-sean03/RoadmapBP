
import { TableData } from "./types"
import { useTheme } from "next-themes"

interface TableProps {
  data: TableData[]
  headers: string[]
}

export const MilestoneTable = ({ data, headers }: TableProps) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className={`${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                rowIndex % 2 === 0
                  ? isDark
                    ? "bg-gray-900/50"
                    : "bg-gray-50"
                  : isDark
                  ? "bg-gray-800/50"
                  : "bg-white"
              }`}
            >
              {headers.map((header, colIndex) => {
                const cellText = row[header] || ""
                let textColor = isDark ? "text-gray-200" : "text-gray-900"

                if (header.toLowerCase().includes("status") || header.toLowerCase().includes("priority")) {
                  if (cellText.toLowerCase().includes("high")) {
                    textColor = "text-red-500"
                  } else if (cellText.toLowerCase().includes("medium")) {
                    textColor = "text-orange-500"
                  } else if (cellText.toLowerCase().includes("complete")) {
                    textColor = "text-green-500"
                  } else {
                    textColor = isDark ? "text-gray-400" : "text-gray-500"
                  }
                }

                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-sm ${textColor} ${
                      header.toLowerCase().includes("status") || header.toLowerCase().includes("priority")
                        ? "font-medium"
                        : ""
                    }`}
                  >
                    {cellText}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const RiskTable = ({ data, headers }: TableProps) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className={`${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-left text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                rowIndex % 2 === 0
                  ? isDark
                    ? "bg-gray-900/50"
                    : "bg-gray-50"
                  : isDark
                  ? "bg-gray-800/50"
                  : "bg-white"
              }`}
            >
              {headers.map((header, colIndex) => {
                const cellText = row[header] || ""
                let textColor = isDark ? "text-gray-200" : "text-gray-900"

                if (header.toLowerCase().includes("impact") || header.toLowerCase().includes("probability")) {
                  if (cellText.toLowerCase().includes("high")) {
                    textColor = "text-red-500"
                  } else if (cellText.toLowerCase().includes("medium")) {
                    textColor = "text-orange-500"
                  } else {
                    textColor = "text-green-500"
                  }
                } else if (header.toLowerCase().includes("status")) {
                  if (cellText.toLowerCase().includes("mitigated")) {
                    textColor = "text-green-500"
                  } else {
                    textColor = isDark ? "text-gray-400" : "text-gray-500"
                  }
                }

                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-sm ${textColor} ${
                      header.toLowerCase().includes("impact") ||
                      header.toLowerCase().includes("probability") ||
                      header.toLowerCase().includes("status")
                        ? "font-medium"
                        : ""
                    }`}
                  >
                    {cellText}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 