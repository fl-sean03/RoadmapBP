import { Button } from "@/components/ui/button"
import { Check, Copy, Download, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, FileCode } from "lucide-react"

interface PhaseActionsProps {
  onCopy: () => void
  onDownload: (format: 'pdf' | 'md' | 'txt') => void
  copied: boolean
  phaseNumber: number
}

export const PhaseActions = ({ onCopy, onDownload, copied, phaseNumber }: PhaseActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCopy}
        className="hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {copied ? <Check className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" /> : <Copy className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" />}
        <span className="hidden lg:block">{copied ? "Copied!" : "Copy Phase"}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="lg:h-4 lg:w-4 h-3 w-3 lg:mr-2 mr-1" />
            <span className="hidden lg:block">Download Phase {phaseNumber}</span>
            <ChevronDown className="lg:h-4 lg:w-4 h-3 w-3 lg:ml-2 ml-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onDownload('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Download as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDownload('md')}>
            <FileCode className="h-4 w-4 mr-2" />
            Download as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDownload('txt')}>
            <FileText className="h-4 w-4 mr-2" />
            Download as Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 