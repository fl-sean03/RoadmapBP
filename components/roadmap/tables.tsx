import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Flag } from "lucide-react"
import { TableData } from "./types"

export const MilestoneTable = ({ data, headers }: { data: TableData[]; headers: string[] }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="h-5 w-5 text-primary" />
          Project Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, idx) => (
                <TableHead key={idx} className="font-semibold">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/50">
                {headers.map((header, cellIdx) => (
                  <TableCell key={cellIdx} className="py-3">
                    {header.toLowerCase().includes("status") ? (
                      <Badge variant={row[header]?.toLowerCase().includes("complete") ? "default" : "secondary"}>
                        {row[header]}
                      </Badge>
                    ) : header.toLowerCase().includes("priority") ? (
                      <Badge
                        variant={
                          row[header]?.toLowerCase().includes("high")
                            ? "destructive"
                            : row[header]?.toLowerCase().includes("medium")
                              ? "default"
                              : "secondary"
                        }
                      >
                        {row[header]}
                      </Badge>
                    ) : (
                      <span className="text-sm">{row[header]}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export const RiskTable = ({ data, headers }: { data: TableData[]; headers: string[] }) => {
  const getRiskIcon = (impact: string) => {
    const level = impact?.toLowerCase()
    if (level?.includes("high")) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (level?.includes("medium")) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-green-500" />
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, idx) => (
                <TableHead key={idx} className="font-semibold">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/50">
                {headers.map((header, cellIdx) => (
                  <TableCell key={cellIdx} className="py-3">
                    {header.toLowerCase().includes("impact") || header.toLowerCase().includes("probability") ? (
                      <div className="flex items-center gap-2">
                        {getRiskIcon(row[header])}
                        <Badge
                          variant={
                            row[header]?.toLowerCase().includes("high")
                              ? "destructive"
                              : row[header]?.toLowerCase().includes("medium")
                                ? "default"
                                : "secondary"
                          }
                        >
                          {row[header]}
                        </Badge>
                      </div>
                    ) : header.toLowerCase().includes("status") ? (
                      <Badge variant={row[header]?.toLowerCase().includes("mitigated") ? "default" : "secondary"}>
                        {row[header]}
                      </Badge>
                    ) : (
                      <span className="text-sm">{row[header]}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 