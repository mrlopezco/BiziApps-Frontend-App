import { Job } from "@/lib/types/jobs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, ExternalLink, MapPin, Building2, Clock, DollarSign, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const formatSalary = () => {
    if (job.min_salary && job.max_salary) {
      return `${job.currency || "$"}${job.min_salary.toLocaleString()} - ${job.currency || "$"}${job.max_salary.toLocaleString()}`
    } else if (job.min_salary) {
      return `From ${job.currency || "$"}${job.min_salary.toLocaleString()}`
    } else if (job.max_salary) {
      return `Up to ${job.currency || "$"}${job.max_salary.toLocaleString()}`
    }
    return null
  }

  const formatLocation = () => {
    const parts = []
    if (job.location_city) parts.push(job.location_city)
    if (job.location_country) parts.push(job.location_country)
    if (job.is_remote) parts.push("Remote")
    return parts.join(", ") || "Location not specified"
  }

  const formatDatePosted = () => {
    if (!job.date_posted) return null
    try {
      return formatDistanceToNow(new Date(job.date_posted), { addSuffix: true })
    } catch {
      return null
    }
  }

  return (
    <Card className="bg-background/50 backdrop-blur-[24px] border-border hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">{job.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{formatLocation()}</span>
              </div>
              {formatDatePosted() && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDatePosted()}</span>
                </div>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => window.open(job.job_url, "_blank")} className="shrink-0">
            <ExternalLink className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Job Details */}
        <div className="flex flex-wrap gap-2 mb-3">
          {job.job_type && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {job.job_type}
            </Badge>
          )}
          {job.job_role && (
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {job.job_role}
            </Badge>
          )}
          {job.primary_product && (
            <Badge variant="outline" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              {job.primary_product}
            </Badge>
          )}
          {formatSalary() && (
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatSalary()}
            </Badge>
          )}
          {job.visa_sponsorship && (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
              Visa Sponsorship
            </Badge>
          )}
          {job.is_remote && (
            <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
              Remote
            </Badge>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {job.description}
          </CardDescription>
        )}

        {/* Additional Info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {job.source_site && <span>Source: {job.source_site}</span>}
            {job.min_experience_years && <span>Min. Experience: {job.min_experience_years} years</span>}
          </div>
          {job.relevance_score && (
            <div className="flex items-center gap-1">
              <span>Relevance: {job.relevance_score}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
