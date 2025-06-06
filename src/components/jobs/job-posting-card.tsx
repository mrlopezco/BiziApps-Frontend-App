import { Job } from "@/lib/types/jobs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Flag, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface JobPostingCardProps {
  job: Job
  onViewDetails?: () => void
  onBookmark?: () => void
  onReport?: () => void
}

export function JobPostingCard({ job, onViewDetails, onBookmark, onReport }: JobPostingCardProps) {
  // Generate two-letter abbreviations
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
    // Default mapping - you can customize this based on your source types
    if (source.toLowerCase().includes("partner")) return "P"
    if (source.toLowerCase().includes("recruit")) return "R"
    return "C"
  }

  const getCountryFlag = (country: string) => {
    if (!country) return "🌍"
    // Simple country flag mapping - you can expand this
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

    if (score >= 10 && score <= 14) {
      return { level: "low" }
    } else if (score >= 15 && score <= 17) {
      return { level: "medium" }
    } else if (score > 17) {
      return { level: "high" }
    }
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

  const SignalBars = ({ level }: { level: "low" | "medium" | "high" }) => (
    <div className="flex items-end gap-0.5">
      <div
        className={cn(
          "w-1 h-2 rounded-sm",
          level === "low" ? "bg-red-500" : level === "medium" ? "bg-yellow-500" : "bg-green-500",
        )}
      />
      <div
        className={cn(
          "w-1 h-3 rounded-sm",
          level === "medium" ? "bg-yellow-500" : level === "high" ? "bg-green-500" : "bg-gray-200",
        )}
      />
      <div className={cn("w-1 h-4 rounded-sm", level === "high" ? "bg-green-500" : "bg-gray-200")} />
    </div>
  )

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
    // Since the Job type doesn't seem to have a direct company field,
    // we'll try to extract it from source_site or use a placeholder
    if (job.source_site) {
      // Clean up common job site names
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

    // Determine how many digits to round based on the length
    const roundTo = length > 2 ? length - 2 : 0 // Round to last 2 digits for 3 digits, last 3 for 4 digits, etc.

    return Math.floor(salary / Math.pow(10, roundTo)) * Math.pow(10, roundTo)
  }

  const formatSalary = (salary: number): string => {
    return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Log the job variable
  console.log(job)

  return (
    <Card className="bg-background/50 backdrop-blur-[24px]  hover:shadow-lg transition-all duration-200 border-secondary h-64 flex flex-col bg-white text-black min-h-[300px]">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Combined Top + Middle Section - 80% Height */}
        <div
          className={cn("h-[80%] p-4 m-1 rounded-lg flex flex-col mb-5", getBackgroundColor(confidenceSignal.level))}
        >
          {/* Top Area - Icons and Signal */}
          <div className="flex justify-between items-center mb-4">
            {/* Top Left - Icons */}
            <div className="flex items-center gap-1.5">
              {/* Role Icon */}
              <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {getRoleAbbreviation(job.job_role || "")}
              </div>
              {/* Product Icon */}
              <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {getProductAbbreviation(job.primary_product || "")}
              </div>
              {/* Source Abbreviation */}
              <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {getSourceAbbreviation(job.source_site || "")}
              </div>
              {/* Country Flag */}
              <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {getCountryFlag(job.location_country || "")}
              </div>
            </div>

            {/* Top Right - Confidence Signal */}
            <div className="flex items-center">
              {/* <SignalBars level={confidenceSignal.level} /> */}
              <Button variant="default" size="sm" onClick={onBookmark} className="h-7 w-7 p-0 hover:bg-muted">
                <Bookmark className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Middle Area - Content */}
          <div className="flex-1 flex flex-col justify-center text-left ">
            {/* Company Name */}
            <p className="text-sm text-muted-foreground mb-1 truncate">{getCompanyName()}</p>

            {/* Job Title */}
            <h3 className="text-lg font-semibold text- mb-3 line-clamp-2 leading-tight">{job.title}</h3>

            {/* Job Attributes Bubbles */}
            <div className="flex flex-wrap justify-start gap-1">
              {formatJobAttributes()
                .slice(0, 3)
                .map((attribute, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1 rounded-full bg-white/70 text-muted-foreground hover:bg-white/90 transition-colors"
                  >
                    {attribute}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - 20% Height */}
        <div className="flex justify-between h-[20%] min-h-[3rem] px-4 pb-4">
          {/* Bottom Left - Action Buttons */}
          <div className="flex flex-col h-full">
            <span className="font-semibold">
              {job.min_salary !== null ? `$${formatSalary(roundSalary(job.min_salary))}` : ""}
            </span>
            <span className="text-xs text-muted-foreground mt-auto">{formatLocation()}</span>
          </div>
          {/* Bottom Right - Primary CTA */}
          <Button
            onClick={onViewDetails}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
