import { Job } from "@/lib/types/jobs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ExternalLink, MapPin, Calendar, Clock, DollarSign, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface JobDetailsDialogProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookmark?: () => void
}

export function JobDetailsDialog({ job, open, onOpenChange, onBookmark }: JobDetailsDialogProps) {
  if (!job) return null

  // Same helper functions as in JobPostingCard
  const getRoleAbbreviation = (role: string) => {
    if (!role) return "JB"
    const words = role.split(" ")
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return role.substring(0, 2).toUpperCase()
  }

  const getProductAbbreviation = (product: string) => {
    if (!product) return "PR"
    const words = product.split(" ")
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return product.substring(0, 2).toUpperCase()
  }

  const getSourceAbbreviation = (source: string) => {
    if (!source) return "C"
    if (source.toLowerCase().includes("partner")) return "P"
    if (source.toLowerCase().includes("recruit")) return "R"
    return "C"
  }

  const getCountryFlag = (country: string) => {
    if (!country) return "🌍"
    const flagMap: { [key: string]: string } = {
      "united states": "🇺🇸",
      usa: "🇺🇸",
      canada: "🇨🇦",
      "united kingdom": "🇬🇧",
      uk: "🇬🇧",
      germany: "🇩🇪",
      france: "🇫🇷",
      spain: "🇪🇸",
      italy: "🇮🇹",
      netherlands: "🇳🇱",
      australia: "🇦🇺",
      japan: "🇯🇵",
      india: "🇮🇳",
      singapore: "🇸🇬",
    }
    return flagMap[country.toLowerCase()] || "🌍"
  }

  const getConfidenceSignal = (score?: number): { level: "low" | "medium" | "high" } => {
    if (!score) return { level: "low" }
    if (score >= 10 && score <= 14) return { level: "low" }
    else if (score >= 15 && score <= 17) return { level: "medium" }
    else if (score > 17) return { level: "high" }
    return { level: "low" }
  }

  const confidenceSignal = getConfidenceSignal(job.relevance_score ?? undefined)

  const getBackgroundColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "bg-[#d4f6ed]"
      case "medium":
        return "bg-[#e3dbfa]"
      case "low":
        return "bg-[#ffe1cc]"
      default:
        return "bg-[#ffe1cc]"
    }
  }

  const formatJobAttributes = () => {
    const attributes = []
    if (job.job_type) attributes.push(job.job_type)
    if (job.is_remote) attributes.push("Remote")
    if (job.visa_sponsorship) attributes.push("Visa Sponsorship")
    if (job.min_experience_years) attributes.push(`${job.min_experience_years}+ years`)
    return attributes
  }

  const formatLocation = () => {
    const parts = []
    if (job.location_city) parts.push(job.location_city)
    if (job.location_country) parts.push(job.location_country)
    return parts.join(", ") || "Remote"
  }

  const getCompanyName = () => {
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

  const roundSalary = (salary: number): number => {
    const salaryString = salary.toString()
    const length = salaryString.length
    const roundTo = length > 2 ? length - 2 : 0
    return Math.floor(salary / Math.pow(10, roundTo)) * Math.pow(10, roundTo)
  }

  const formatSalary = (salary: number): string => {
    return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const formatDatePosted = (dateString: string | null) => {
    if (!dateString) return "Date not available"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return "Date not available"
    }
  }

  const handleApplyNow = () => {
    if (job.job_url) {
      window.open(job.job_url, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="bg-white text-black flex flex-col">
          {/* Top Section - Same as card */}
          <div className={cn("p-6 m-1 rounded-lg", getBackgroundColor(confidenceSignal.level))}>
            {/* Top Icons and Signal */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {getRoleAbbreviation(job.job_role || "")}
                </div>
                <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {getProductAbbreviation(job.primary_product || "")}
                </div>
                <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {getSourceAbbreviation(job.source_site || "")}
                </div>
                <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {getCountryFlag(job.location_country || "")}
                </div>
              </div>
              <Button variant="default" size="sm" onClick={onBookmark} className="h-7 w-7 p-0 hover:bg-muted">
                <Bookmark className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Company and Title */}
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-1">{getCompanyName()}</p>
              <h2 className="text-2xl font-bold mb-4 leading-tight">{job.title}</h2>

              {/* Job Attributes */}
              <div className="flex flex-wrap gap-2">
                {formatJobAttributes().map((attribute, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-3 py-1 rounded-full bg-white/70 text-muted-foreground hover:bg-white/90 transition-colors"
                  >
                    {attribute}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Expanded Details Section */}
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {/* Job Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{formatLocation()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Posted {formatDatePosted(job.date_posted)}</span>
              </div>
              {job.min_experience_years && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{job.min_experience_years}+ years experience</span>
                </div>
              )}
              {job.source_site && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{job.source_site}</span>
                </div>
              )}
            </div>

            {/* Salary Range */}
            {(job.min_salary || job.max_salary) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Salary Range</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {job.min_salary && `$${formatSalary(roundSalary(job.min_salary))}`}
                  {job.min_salary && job.max_salary && " - "}
                  {job.max_salary && `$${formatSalary(roundSalary(job.max_salary))}`}
                  {job.currency && job.currency !== "USD" && ` ${job.currency}`}
                </div>
              </div>
            )}

            {/* Job Description */}
            {job.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Job Description</h3>
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: job.description.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Relevance Information */}
            {job.relevance_reason && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800">Why this job matches you</h3>
                <p className="text-sm text-blue-700">{job.relevance_reason}</p>
                {job.relevance_score && (
                  <div className="mt-2 text-xs text-blue-600">Match Score: {job.relevance_score}/20</div>
                )}
              </div>
            )}

            {/* Additional Products */}
            {job.secondary_product && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Related Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{job.primary_product}</Badge>
                  <Badge variant="outline">{job.secondary_product}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Bottom CTA Section */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="flex flex-col">
              <span className="font-semibold text-lg">
                {job.min_salary ? `$${formatSalary(roundSalary(job.min_salary))}` : "Salary not specified"}
              </span>
              <span className="text-sm text-muted-foreground">{formatLocation()}</span>
            </div>

            {/* Prominent Apply Button */}
            <Button
              onClick={handleApplyNow}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Apply Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
