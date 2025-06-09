import { JobWithInteraction } from "@/lib/types/jobs"
import { Dialog } from "@/components/ui/dialog"
import { JobCardDialogContent } from "@/components/ui/dialog" // Using the custom variant
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ExternalLink, MapPin, Calendar, Clock, DollarSign, Globe, ThumbsUp, ThumbsDown } from "lucide-react" // Removed ChevronDown, ChevronUp
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState, useTransition, useEffect } from "react"
import { toggleJobBookmark, voteOnJob } from "@/lib/actions/job-interactions"

interface JobDetailsDialogProps {
  job: JobWithInteraction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
  const [isPending, startTransition] = useTransition()

  // Local state for optimistic updates
  const [localBookmarkState, setLocalBookmarkState] = useState(job?.user_interaction?.is_favorite ?? false)
  const [hasApplied, setHasApplied] = useState(false)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(job?.user_interaction?.vote_type ?? null)

  const isBookmarked = localBookmarkState

  // Reset hasApplied state when dialog opens
  useEffect(() => {
    if (open) {
      setHasApplied(false)
    }
  }, [open])

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!job) return

    // Optimistically update the UI
    const newBookmarkState = !localBookmarkState
    setLocalBookmarkState(newBookmarkState)

    startTransition(async () => {
      const result = await toggleJobBookmark(job.id)

      if (!result.success) {
        // Revert the optimistic update if the server action failed
        setLocalBookmarkState(localBookmarkState)
      }
    })
  }
  // Removed: const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  // Removed: useEffect to reset expanded state

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
    // Use the actual company information from the joined table
    if (job.company?.company_name) {
      return job.company.company_name
    }

    // Fallback to extracting from source_site if company data is not available
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
      setHasApplied(true)
    }
  }

  const handleVote = (voteType: "upvote" | "downvote") => {
    if (!job) return

    // Optimistically update the UI
    const newVote = userVote === voteType ? null : voteType
    setUserVote(newVote)

    startTransition(async () => {
      if (newVote) {
        const result = await voteOnJob(job.id, newVote)
        if (!result.success) {
          // Revert the optimistic update if the server action failed
          setUserVote(userVote)
        }
      }
    })
  }

  // Function to detect if text contains markdown
  const isMarkdown = (text: string) => {
    const markdownPatterns = [
      /#{1,6}\s+/g, // Headers
      /\*\*[^*]+\*\*/g, // Bold
      /\*[^*]+\*/g, // Italic
      /`[^`]+`/g, // Inline code
      /```[\s\S]*?```/g, // Code blocks
      /\[[^\]]+\]\([^)]+\)/g, // Links
      /^\s*[-*+]\s+/gm, // Unordered lists
      /^\s*\d+\.\s+/gm, // Ordered lists
      /^\s*>\s+/gm, // Blockquotes
    ]

    return markdownPatterns.some((pattern) => pattern.test(text))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <JobCardDialogContent className="w-[80vw] h-[80vh] flex flex-col overflow-hidden">
        <div className="bg-white text-black flex flex-col h-full rounded-lg shadow-xl">
          {/* Top Section - Same as card */}
          <div
            className={cn("p-6 m-1 rounded-lg min-h-[150px] flex-shrink-0", getBackgroundColor(confidenceSignal.level))}
            id="job-details-dialog-top-section"
          >
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
                {/* Microsoft Partner Badge */}
                {job.company?.is_msft_partner && (
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    P
                  </div>
                )}
                <div className="w-6 h-6 bg-white/60 rounded flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {getCountryFlag(job.location_country || "")}
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={isPending}
                className={cn(
                  "h-10 w-10 p-0 mr-10 hover:bg-muted transition-colors",
                  isBookmarked && "bg-green-500 text-white hover:bg-green-600",
                )}
              >
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

          {/* Expanded Details Section - Middle (most important) */}
          <div
            className="px-6 py-4 flex-grow overflow-y-auto min-h-[200px]" // `overflow-y-auto` ensures scrollbar when content exceeds height
            id="job-details-dialog-expanded-details-section"
          >
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Job Description</h3>
                  {/* Removed the "Show More/Less" button and its conditional rendering */}
                </div>
                <div
                  className={cn(
                    "relative transition-all duration-300 ease-in-out",
                    // Removed max-h-48, overflow-hidden, and conditional classes
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    {isMarkdown(job.description) ? (
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom styling for markdown elements
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                            p: ({ children }) => <p className="mb-2">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs font-mono mb-2">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
                                {children}
                              </blockquote>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {job.description}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: job.description.replace(/\n/g, "<br/>"),
                        }}
                      />
                    )}
                  </div>
                  {/* Removed the fade overlay */}
                </div>
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
          <div
            className="flex justify-between items-center p-6 border-t bg-gray-50 min-h-[100px] flex-shrink-0"
            id="job-details-dialog-bottom-cta-section"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-lg">
                {job.min_salary ? `$${formatSalary(roundSalary(job.min_salary))}` : "Salary not specified"}
              </span>
              <span className="text-sm text-muted-foreground">{formatLocation()}</span>
            </div>

            {hasApplied ? (
              /* Voting Buttons */
              <div className="flex gap-3">
                <Button
                  onClick={() => handleVote("upvote")}
                  size="lg"
                  disabled={isPending}
                  className={cn(
                    "px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
                    userVote === "upvote"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
                  )}
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  {userVote === "upvote" ? "Upvoted" : "Upvote"}
                </Button>
                <Button
                  onClick={() => handleVote("downvote")}
                  size="lg"
                  disabled={isPending}
                  className={cn(
                    "px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
                    userVote === "downvote"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
                  )}
                >
                  <ThumbsDown className="h-5 w-5 mr-2" />
                  {userVote === "downvote" ? "Downvoted" : "Downvote"}
                </Button>
              </div>
            ) : (
              /* Prominent Apply Button */
              <Button
                onClick={handleApplyNow}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </JobCardDialogContent>
    </Dialog>
  )
}
