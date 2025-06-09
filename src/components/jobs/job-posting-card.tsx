import { JobWithInteraction } from "@/lib/types/jobs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useState, useTransition } from "react"
import { toggleJobBookmark } from "@/lib/actions/job-interactions"
import Flag from "react-world-flags" // Import the Flag component

interface JobPostingCardProps {
  job: JobWithInteraction
  onViewDetails?: () => void
}

export function JobPostingCard({ job, onViewDetails }: JobPostingCardProps) {
  // Function to get role abbreviation (now spelled out as a placeholder for clarity)
  const getRoleAbbreviation = (role: string) => {
    if (!role) return "JOB" // Changed from JB to JOB for full word
    const words = role.split(" ")
    if (words.length >= 2) {
      return words
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
    }
    return role.substring(0, 2).toUpperCase() // Take up to 3 characters if one word
  }

  // The following functions were identified as "assigned a value but never used"
  // because they were defined but not called anywhere in the component's JSX or logic.
  // I've removed them to clean up the code and resolve the ESLint errors.
  // If you intend to use them in the future, you'll need to uncomment and
  // integrate them into your component's rendering or logic.

  // const getProductAbbreviation = (product: string) => {
  //   if (!product) return "PRODUCT" // Changed from PR to PRODUCT
  //   const words = product.split(" ")
  //   if (words.length >= 2) {
  //     return words
  //       .slice(0, 2)
  //       .map((word) => word.charAt(0))
  //       .join("")
  //       .toUpperCase()
  //   }
  //   return product.substring(0, 3).toUpperCase() // Take up to 3 characters if one word
  // }

  // const getSourceAbbreviation = (source: string) => {
  //   if (!source) return "COMMON" // Changed from C to COMMON
  //   if (source.toLowerCase().includes("partner")) return "PARTNER" // Changed from P to PARTNER
  //   if (source.toLowerCase().includes("recruit")) return "RECRUIT" // Changed from R to RECRUIT
  //   return "COMMON" // Default to COMMON
  // }

  // const getCompanyLogo = () => {
  //   return job.company?.company_logo || null
  // }

  // const getCompanyDetails = () => {
  //   if (job.company) {
  //     return {
  //       name: job.company.company_name,
  //       industry: job.company.company_industry,
  //       size: job.company.company_num_employees,
  //       rating: job.company.company_rating,
  //       isMsftPartner: job.company.is_msft_partner,
  //     }
  //   }
  //   return null
  // }

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

  const formatJobAttributes = () => {
    const attributes = []

    // Handle job_type which might be an array or string
    if (job.job_type) {
      if (Array.isArray(job.job_type)) {
        // If it's an array, add all types (limit to first 2 to avoid overcrowding)
        attributes.push(...job.job_type.slice(0, 2))
      } else if (typeof job.job_type === "string") {
        // Try to parse as JSON array first
        try {
          const parsedArray = JSON.parse(job.job_type)
          if (Array.isArray(parsedArray)) {
            attributes.push(...parsedArray.slice(0, 2))
          } else {
            attributes.push(job.job_type)
          }
        } catch {
          // If parsing fails, treat as regular string
          attributes.push(job.job_type)
        }
      }
    }

    if (job.is_remote) attributes.push("Remote")
    if (job.visa_sponsorship) attributes.push("Visa Sponsorship")
    if (job.min_experience_years) attributes.push(`${job.min_experience_years}+ years`)
    return attributes
  }

  const formatLocation = () => {
    if (job.is_remote) return "Remote" // Display "Remote" if is_remote is true
    const parts = []
    if (job.location_city && job.location_city !== "Remote") parts.push(job.location_city) // Only add city if it's not "Remote"
    if (job.location_country) parts.push(job.location_country)
    return parts.join(", ") || "Remote"
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

  const roundSalary = (salary: number): number => {
    const salaryString = salary.toString()
    const length = salaryString.length

    const roundTo = length > 2 ? length - 2 : 0

    return Math.floor(salary / Math.pow(10, roundTo)) * Math.pow(10, roundTo)
  }

  const formatSalary = (salary: number): string => {
    return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const [isHovering, setIsHovering] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [localBookmarkState, setLocalBookmarkState] = useState(job.user_interaction?.is_favorite ?? false)

  const isBookmarked = localBookmarkState

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    const newBookmarkState = !localBookmarkState
    setLocalBookmarkState(newBookmarkState)

    startTransition(async () => {
      const result = await toggleJobBookmark(job.id)

      if (!result.success) {
        setLocalBookmarkState(localBookmarkState)
      }
    })
  }

  // Helper function to normalize country input to a 2-letter or 3-letter ISO code
  const getNormalizedCountryCode = (country: string): string => {
    if (!country) return ""

    const lowerCountry = country.toLowerCase()

    // Mapping common full names or variations to 2-letter ISO codes
    if (lowerCountry === "united states" || lowerCountry === "usa") return "US"
    if (lowerCountry === "canada") return "CA"
    if (lowerCountry === "united kingdom" || lowerCountry === "uk") return "GB" // ISO code for UK is GB
    if (lowerCountry === "germany") return "DE"
    if (lowerCountry === "france") return "FR"
    if (lowerCountry === "spain") return "ES"
    if (lowerCountry === "italy") return "IT"
    if (lowerCountry === "netherlands") return "NL"
    if (lowerCountry === "australia") return "AU"
    if (lowerCountry === "japan") return "JP"
    if (lowerCountry === "india") return "IN"
    if (lowerCountry === "singapore") return "SG"
    // Add more mappings as needed for other countries you expect

    // If it's already a 2-letter or 3-letter code, return it as is (uppercased)
    if (country.length === 2 || country.length === 3) {
      return country.toUpperCase()
    }

    // Return empty string if no recognized code is found, triggering the fallback
    return ""
  }

  return (
    <Card className="rounded-lg bg-background/50 backdrop-blur-[24px] hover:shadow-lg transition-all duration-200 border-secondary h-64 flex flex-col bg-white text-black min-h-[300px]">
      <CardContent className="p-0 flex flex-col h-full">
        <div
          onClick={onViewDetails}
          className={cn(
            "h-[80%] p-4 m-1 rounded-lg flex flex-col mb-5 cursor-pointer",
            getBackgroundColor(confidenceSignal.level),
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {getRoleAbbreviation(job.job_role || "")}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{job.job_role}</TooltipContent>
              </Tooltip>

              {/* <Tooltip>
                <TooltipTrigger>
                  <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {getProductAbbreviation(job.primary_product || "")}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{job.primary_product}</TooltipContent>
              </Tooltip> */}

              {/* Microsoft Partner Badge */}
              {job.company?.is_msft_partner && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      P
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Microsoft Partner</TooltipContent>
                </Tooltip>
              )}

              {job.location_country && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground overflow-hidden">
                      <Flag
                        code={getNormalizedCountryCode(job.location_country)}
                        fallback={<span className="text-muted-foreground">🌍</span>}
                        className="w-full h-full object-cover p-1"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{job.location_country}</TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center">
              <Button
                variant="default"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={isPending}
                className={cn(
                  "h-7 w-7 p-0 hover:bg-muted transition-colors",
                  isBookmarked && "bg-green-500 text-white hover:bg-green-600",
                )}
              >
                <Bookmark className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center text-left ">
            <p className="text-sm text-muted-foreground mb-1 truncate">{getCompanyName()}</p>

            <h3 className="text-lg font-semibold text- mb-3 line-clamp-2 leading-tight mb-2">{job.title}</h3>

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

        <div className="flex justify-between h-[20%] min-h-[3rem] px-4 pb-4 items-center">
          <div className="flex flex-col h-full justify-center">
            <span className="font-semibold">
              {job.min_salary !== null ? `$${formatSalary(roundSalary(job.min_salary))}` : ""}
            </span>
            <span className="text-xs text-muted-foreground mt-auto">{formatLocation()}</span>
          </div>

          <Button
            onClick={onViewDetails}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 overflow-hidden relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <ArrowRight
              className={cn(
                "h-4 w-4 transition-transform duration-200 absolute left-2.5",
                isHovering && "transform translate-x-1",
              )}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
