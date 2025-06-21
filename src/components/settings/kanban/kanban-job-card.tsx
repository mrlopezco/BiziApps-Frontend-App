"use client"

import { useState } from "react"
import { JobWithInteraction } from "@/lib/types/jobs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ExternalLink, MapPin, DollarSign, Calendar, StickyNote, Eye } from "lucide-react"
import { formatDistance, parseISO } from "date-fns"
import Flag from "react-world-flags"

interface KanbanJobCardProps {
  job: JobWithInteraction
  onJobSelect: (job: JobWithInteraction) => void
  onUpdateNotes: (jobId: string, notes: string) => void
  isPending: boolean
}

// Utility function to get normalized country code for flags
const getNormalizedCountryCode = (country: string): string => {
  const countryCodeMap: Record<string, string> = {
    "United States": "US",
    "United Kingdom": "GB",
    Germany: "DE",
    Canada: "CA",
    Australia: "AU",
    Netherlands: "NL",
    France: "FR",
    Spain: "ES",
    Italy: "IT",
    Sweden: "SE",
    Norway: "NO",
    Denmark: "DK",
    Finland: "FI",
    Switzerland: "CH",
    Austria: "AT",
    Belgium: "BE",
    Ireland: "IE",
    Poland: "PL",
    "Czech Republic": "CZ",
    Portugal: "PT",
  }

  return countryCodeMap[country] || country.slice(0, 2).toUpperCase()
}

export function KanbanJobCard({ job, onJobSelect, onUpdateNotes, isPending }: KanbanJobCardProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState(job.user_interaction?.notes || "")

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", job.id)
  }

  const handleNotesSubmit = () => {
    onUpdateNotes(job.id, notes)
    setIsEditingNotes(false)
  }

  const handleNotesCancel = () => {
    setNotes(job.user_interaction?.notes || "")
    setIsEditingNotes(false)
  }

  const getCompanyName = () => {
    if (job.company?.company_name) {
      return job.company.company_name
    }
    if (job.source_site) {
      const cleanSite = job.source_site
        .replace(/\.com|\.co\.uk|\.org/gi, "")
        .replace(/jobs|careers|hiring/gi, "")
        .trim()
      if (cleanSite && cleanSite.length > 2) {
        return cleanSite.charAt(0).toUpperCase() + cleanSite.slice(1)
      }
    }
    return "Company"
  }

  const formatSalary = () => {
    if (job.min_salary || job.max_salary) {
      const currency = job.currency || "USD"
      const formatNumber = (num: number) => new Intl.NumberFormat().format(num)

      if (job.min_salary && job.max_salary) {
        return `${currency} ${formatNumber(job.min_salary)} - ${formatNumber(job.max_salary)}`
      } else if (job.min_salary) {
        return `${currency} ${formatNumber(job.min_salary)}+`
      } else if (job.max_salary) {
        return `Up to ${currency} ${formatNumber(job.max_salary)}`
      }
    }
    return null
  }

  return (
    <Card
      className="cursor-move hover:shadow-md transition-all duration-200 bg-white"
      draggable
      onDragStart={handleDragStart}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1 truncate">{getCompanyName()}</p>
            <h4 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">{job.title}</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-2 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onJobSelect(job)
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>

        {/* Job Attributes */}
        <div className="flex flex-wrap gap-1">
          {job.location_country && (
            <div className="flex items-center gap-1">
              <Flag
                code={getNormalizedCountryCode(job.location_country)}
                fallback={<MapPin className="h-3 w-3" />}
                className="w-3 h-3"
              />
              <span className="text-xs text-muted-foreground">{job.location_country}</span>
            </div>
          )}

          {job.is_remote && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              Remote
            </Badge>
          )}

          {job.job_type && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              {Array.isArray(job.job_type) ? job.job_type[0] : job.job_type}
            </Badge>
          )}
        </div>

        {/* Salary */}
        {formatSalary() && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            <span>{formatSalary()}</span>
          </div>
        )}

        {/* Date Posted */}
        {job.date_posted && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDistance(parseISO(job.date_posted), new Date(), { addSuffix: true })}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Notes Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <StickyNote className="h-3 w-3" />
            <span>Notes</span>
          </div>

          {isEditingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder="Add your application notes..."
                className="text-xs min-h-[60px] resize-none"
                disabled={isPending}
              />
              <div className="flex gap-1">
                <Button size="sm" className="text-xs h-6 px-2" onClick={handleNotesSubmit} disabled={isPending}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-6 px-2"
                  onClick={handleNotesCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="text-xs text-muted-foreground cursor-text min-h-[40px] p-2 border rounded bg-muted/50 hover:bg-muted transition-colors"
              onClick={() => setIsEditingNotes(true)}
            >
              {notes || "Click to add notes about this application..."}
            </div>
          )}
        </div>

        {/* External Link */}
        {job.job_url && (
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7"
              onClick={(e) => {
                e.stopPropagation()
                window.open(job.job_url, "_blank")
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Job
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
